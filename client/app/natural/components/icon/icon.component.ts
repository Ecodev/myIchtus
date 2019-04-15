import { Component, HostBinding, Input } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { merge } from 'lodash';

interface IconType {
    name: string;
    svg?: string;
    font?: string;
    class?: 'negative' | 'neutral' | 'positive';
}

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
})
export class IconComponent {

    private static registered = false;

    @HostBinding('style.color') fgColor = 'inherit';
    @HostBinding('class.material-icons') isMaterialIcon = true;
    @HostBinding('class.mat-icon') isIcon = true;
    @HostBinding('style.min-width.px') width = 24;
    @HostBinding('style.min-height.px') height = 24;
    @HostBinding('style.font-size.px') fontSize = 24;

    @Input() label;
    @Input() labelColor: 'primary' | 'warn' | 'accent' = 'accent';
    @Input() labelPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

    public icon: IconType;
    private readonly svgBase = './assets/';
    /**
     * Mapping table of internal icon aliases
     */
    private readonly mapping: { [key: string]: { font?: string, svg?: string, class?: 'negative' | 'neutral' | 'positive' } } = {
        // 'asdf': {
        //     font: 'trending_down',
        //     class: 'negative',
        // },
        'qr': {
            svg: 'icons/qr.svg',
        },
        'simple-qr': {
            svg: 'icons/simple-qr.svg',
        },
        'own_bookable': {
            svg: 'icons/swimsuit.svg',
        },
        'code': {
            svg: 'icons/input.svg',
        },
        'doors': {
            svg: 'icons/key.svg',
        },
        'family': {
            svg: 'icons/family.svg',
        },
        'lake': {
            svg: 'icons/lake.svg',
        },
        'transactionHistory': {
            svg: 'icons/history.svg',
        },
        'claims': {
            svg: 'icons/claims.svg',
        },
        'finances': {
            svg: 'icons/notes.svg',
        },
        'browse_bookables': {
            svg: 'icons/search.svg',
        },
        'administrator': {
            svg: 'icons/boss.svg',
        },
        'exit': {
            svg: 'icons/exit.svg',
        },
        'ichtus': {
            svg: 'ichtus.svg',
        },
    };

    constructor(public matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this.registerIcons();
    }

    @Input() set name(value: string) {
        const newIcon: IconType = {name: value};
        if (this.mapping[value]) {
            this.icon = merge(newIcon, this.mapping[value]);
        } else {
            newIcon.font = value;
            this.icon = newIcon;
        }
    }

    @Input() set size(val: number) {
        val = val == null ? 24 : val;
        this.height = val;
        this.width = val;
        this.fontSize = val;
    }

    private registerIcons() {

        if (IconComponent.registered) {
            return;
        }

        for (const key in this.mapping) {
            if (this.mapping[key].svg) {
                this.matIconRegistry.addSvgIcon(key,
                    this.domSanitizer.bypassSecurityTrustResourceUrl(this.svgBase + this.mapping[key].svg));
            }
        }

        IconComponent.registered = true;

    }

}