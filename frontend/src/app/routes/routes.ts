import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { TestsComponent } from '../components/tests/tests.component';
import { HistoryComponent } from '../components/history/history.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'tests',
        component: TestsComponent
    },
    {
        path: 'history',
        component: HistoryComponent
    }
];


