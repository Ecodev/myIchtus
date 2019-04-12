import { Component, Input, OnInit } from '@angular/core';
import { CreateUser, CreateUserVariables, UpdateUser, UpdateUserVariables, User, UserVariables } from '../../../shared/generated-types';
import { AbstractDetail } from '../../../admin/shared/components/AbstractDetail';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'lodash';
import { FamilyUserService } from './family-user.service';

@Component({
    selector: 'app-family-member',
    templateUrl: './family-member.component.html',
    styleUrls: ['./family-member.component.scss'],
})
export class FamilyMemberComponent
    extends AbstractDetail<User['user'],
        UserVariables,
        CreateUser['createUser'],
        CreateUserVariables,
        UpdateUser['updateUser'],
        UpdateUserVariables,
        any> implements OnInit {

    @Input() viewer: User['user'];
    @Input() user: User['user'];
    @Input() readonly = false;

    constructor(alertService: AlertService,
                private userService: FamilyUserService,
                router: Router,
                route: ActivatedRoute,
    ) {
        super('user', userService, alertService, router, route);
    }

    /**
     * Replace resolved data from router by input and server query
     */
    ngOnInit() {

        if (this.user && this.user.id) {
            this.service.getOne(this.user.id).subscribe(user => {
                this.data = merge({model: this.service.getEmptyObject()}, {model: user});
                this.setForm();
            });

        } else {
            this.data = {model: Object.assign(this.service.getEmptyObject(), this.service.getDefaultValues())};
            this.setForm();
        }

    }

    public setForm() {
        this.initForm();
        if (this.readonly) {
            this.form.disable();
        }
        const familyRelationship = this.form.get('familyRelationship');
        if (familyRelationship && this.viewer.owner) {
            familyRelationship.disable();
        }

    }

    public postCreate(model) {
        if (model.login) {
            this.userService.requestPasswordReset(model.login).subscribe(() => {
                this.alertService.info('Un mail avec les instructions a été envoyé à ' + model.email, 5000);
            });
        }

    }

}
