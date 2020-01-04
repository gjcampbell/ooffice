import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule, Component } from '@angular/core';

import { AppComponent } from './app.component';
import { OfVirtualTreeModule } from 'of-tree';
import { AppSettingsService } from './services/AppSettingsService';
import { OofficeDemoService } from './services/OofficeDemoService';
import * as Components from './components';

@NgModule({
  declarations: [
    AppComponent,
    Components.GoldenTreeComponent,
    Components.GoldenTreeLineComponent,
    Components.LoadingComponent,
    Components.ShowOffTreeComponent,
    Components.ToolbarComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    OfVirtualTreeModule
  ],
  providers: [AppSettingsService, OofficeDemoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
