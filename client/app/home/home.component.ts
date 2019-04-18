import { Component, OnInit } from '@angular/core';
import { UserService } from '../admin/users/services/user.service';
import { AbstractController } from '../shared/components/AbstractController';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SidenavContainerComponent } from '../natural/modules/sidenav/components/sidenav-container/sidenav-container.component';
import { NaturalSidenavService } from '../natural/modules/sidenav/sidenav.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends AbstractController implements OnInit {

    public menu: SidenavContainerComponent | undefined;

    /**
     * Model for header code search
     */
    public code;

    constructor(private userService: UserService, private router: Router, public route: ActivatedRoute) {
        super();
    }

    ngOnInit() {

        NaturalSidenavService.sideNavsChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            setTimeout(() => {
                this.menu = NaturalSidenavService.sideNavs.get('adminMenu');
            });
        });
    }

    public goToCode() {
        this.router.navigate(['/booking', this.code]);
    }

}
