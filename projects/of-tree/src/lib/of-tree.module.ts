import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as C from './components';

@NgModule({
    declarations: [C.OfVirtualTreeComponent, C.OfBasicTreeComponent, C.SetAttrsDirective],
    imports: [CommonModule],
    exports: [C.OfVirtualTreeComponent, C.OfBasicTreeComponent]
})
export class OfVirtualTreeModule {}
