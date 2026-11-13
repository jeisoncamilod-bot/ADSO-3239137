<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Category;
class CategorySeeder extends Seeder {
 public function run(): void {
  foreach (['architectural'=>'Arquitectónicos','structural'=>'Estructurales','electrical'=>'Eléctricos','hydraulic'=>'Hidráulicos','road'=>'Viales'] as $slug=>$name) {
   Category::query()->updateOrCreate(['slug'=>$slug], ['name'=>$name]);
  }
 }
}
