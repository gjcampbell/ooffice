import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { OfVirtualTreeModule } from 'of-tree';
import { AppSettingsService } from './services/AppSettingsService';
import { OofficeDemoService } from './services/OofficeDemoService';
import { LandingComponent } from './landing.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    OfVirtualTreeModule
  ],
  providers: [AppSettingsService, OofficeDemoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
