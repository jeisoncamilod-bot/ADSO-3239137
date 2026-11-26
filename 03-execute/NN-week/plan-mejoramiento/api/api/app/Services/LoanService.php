<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Engineer;
use App\Models\Loan;
use App\Models\LoanReturn;
use App\Models\Plan;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LoanService
{
    public function create(int $engineerId, int $planId): Loan
    {
        return DB::transaction(function () use ($engineerId, $planId) {
            // Always lock the engineer before the plan.
            $engineer = Engineer::query()
                ->lockForUpdate()
                ->findOrFail($engineerId);

            $plan = Plan::query()
                ->with('category')
                ->lockForUpdate()
                ->findOrFail($planId);

            if (!$engineer->is_active) {
                throw new BusinessRuleException(
                    'ENGINEER_INACTIVE',
                    'El ingeniero está inactivo.'
                );
            }

            if (!$plan->is_active) {
                throw new BusinessRuleException(
                    'PLAN_INACTIVE',
                    'El plano está inactivo.'
                );
            }

            // Retrieve all loans that have not been returned.
            $openLoans = Loan::query()
                ->where('engineer_id', $engineerId)
                ->whereDoesntHave('loanReturn');

            $now = Carbon::now('UTC');

            // Prevent new loans when an engineer has overdue loans.
            if ((clone $openLoans)
                ->where('due_at', '<', $now)
                ->exists()) {
                throw new BusinessRuleException(
                    'OVERDUE_LOANS',
                    'El ingeniero tiene préstamos vencidos.'
                );
            }

            // Each engineer can have a maximum of three open loans.
            if ((clone $openLoans)->count() >= 3) {
                throw new BusinessRuleException(
                    'LOAN_LIMIT_REACHED',
                    'El ingeniero ya tiene tres préstamos abiertos.'
                );
            }

            // Validate inventory consistency before creating a loan.
            if (
                $plan->available_units < 0 ||
                $plan->available_units > $plan->total_units
            ) {
                throw new BusinessRuleException(
                    'INVENTORY_CONFLICT',
                    'El inventario del plano es inconsistente.'
                );
            }

            if ($plan->available_units < 1) {
                throw new BusinessRuleException(
                    'PLAN_UNAVAILABLE',
                    'No hay unidades disponibles para este plano.'
                );
            }

            // Preserve historical plan information.
            $loan = Loan::query()->create([
                'plan_id' => $plan->id,
                'engineer_id' => $engineer->id,
                'plan_code_snapshot' => $plan->code,
                'plan_title_snapshot' => $plan->title,
                'category_name_snapshot' => $plan->category->name,
                'loaned_at' => $now,
                'due_at' => $now->copy()->addDays(6),
            ]);

            // Decrease available inventory within the transaction.
            $plan->decrement('available_units');

            return $loan->fresh();
        }, 3);
    }

    public function returnLoan(int $loanId): LoanReturn
    {
        return DB::transaction(function () use ($loanId) {
            // Read the loan before acquiring locks.
            $loan = Loan::query()->findOrFail($loanId);

            // Keep the same lock order used when creating loans.
            Engineer::query()
                ->lockForUpdate()
                ->findOrFail($loan->engineer_id);

            $plan = Plan::query()
                ->lockForUpdate()
                ->findOrFail($loan->plan_id);

            // A loan can only be returned once.
            if (LoanReturn::query()
                ->where('loan_id', $loanId)
                ->exists()) {
                throw new BusinessRuleException(
                    'ALREADY_RETURNED',
                    'Este préstamo ya fue devuelto.'
                );
            }

            // Validate inventory before restoring the unit.
            if (
                $plan->available_units < 0 ||
                $plan->available_units >= $plan->total_units
            ) {
                throw new BusinessRuleException(
                    'INVENTORY_CONFLICT',
                    'El inventario no permite registrar esta devolución.'
                );
            }

            $loanReturn = LoanReturn::query()->create([
                'loan_id' => $loanId,
                'returned_at' => Carbon::now('UTC'),
            ]);

            // Restore one available unit.
            $plan->increment('available_units');

            return $loanReturn;
        }, 3);
    }
}
