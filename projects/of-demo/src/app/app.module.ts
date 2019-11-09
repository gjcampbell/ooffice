import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ShellComponent } from './shell/shell.component';
import { SiteNavComponent } from './site-nav/site-nav.component';
import * as Mat from '@angular/material';

@NgModule({
    declarations: [AppComponent, ShellComponent, SiteNavComponent],
    imports: [BrowserAnimationsModule, BrowserModule, Mat.MatRippleModule, Mat.MatTooltipModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
