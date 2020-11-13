import {Component, OnInit} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {UserService} from '../users/services/user.service';
import {NaturalAbstractController} from '@ecodev/natural';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent extends NaturalAbstractController implements OnInit {
    public UserService = UserService;
    public adminUserRouteActive = false;
    public adminBookableRouteActive = false;
    public adminBookingRouteActive = false;

    constructor(router: Router, public permissionsService: PermissionsService, public route: ActivatedRoute) {
        super();

        // Update active route status
        router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe(e => {
            if (!(e instanceof NavigationEnd)) {
                return;
            }

            // Unfortunately because /admin/user, /admin/user/newcomer, /admin/user/member and /admin/user/non-active
            // all share the same start of URL we cannot rely on standard routerLinkActive and must carefully check
            // that our admin user route is active. Otherwise we would have two menu entries as active
            const tree = router.parseUrl(router.url);
            const segments = tree.root.children.primary?.segments ?? [];
            this.adminUserRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'user' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!segments[2].path.match(/^\d+$/));

            this.adminBookableRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'bookable' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!segments[2].path.match(/^\d+$/));

            this.adminBookingRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'booking' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!segments[2].path.match(/^\d+$/));
        });
    }

    public ngOnInit(): void {}
}
