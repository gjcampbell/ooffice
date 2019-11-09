import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as C from './components';

@NgModule({
    declarations: [C.VirtualTreeComponent, C.BasicTreeComponent, C.SetAttrsDirective],
    imports: [CommonModule],
    exports: [C.VirtualTreeComponent, C.BasicTreeComponent]
})
export class OfVirtualTreeModule {}
