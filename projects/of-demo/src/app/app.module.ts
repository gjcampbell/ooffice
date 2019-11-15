import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { AppComponent } from './app.component';
import { ShellComponent } from './shell/shell.component';
import { SiteNavComponent } from './site-nav/site-nav.component';
import { SiteContentComponent } from './site-content/site-content.component';
import * as Content from './content';
import * as Design from './design/components';
import * as Mat from '@angular/material';
import { OfVirtualTreeModule } from 'projects/of-tree/src';
import { DynamicComponentDirective } from './components/dynamic-component.directive';

@NgModule({
    declarations: [
        AppComponent,
        DynamicComponentDirective,
        Content.TreeDemoComponent,
        Design.BannerComponent,
        Design.DemoSectionComponent,
        ShellComponent,
        SiteNavComponent,
        SiteContentComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        Mat.MatRippleModule,
        Mat.MatTooltipModule,
        MonacoEditorModule.forRoot(),
        OfVirtualTreeModule
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [Content.TreeDemoComponent]
})
export class AppModule {}
