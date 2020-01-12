import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading',
    template: `
        <div *ngIf="show" class="overlay">
            <svg
                version="1.1"
                id="L2"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="100"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 100 100"
                enable-background="new 0 0 100 100"
                xml:space="preserve"
            >
                <circle fill="none" stroke="#000" stroke-width="4" stroke-miterlimit="10" cx="50" cy="50" r="48"></circle>
                <line
                    fill="none"
                    stroke-linecap="round"
                    stroke="#000"
                    stroke-width="4"
                    stroke-miterlimit="10"
                    x1="50"
                    y1="50"
                    x2="85"
                    y2="50.5"
                    transform="rotate(233.59 50 50)"
                >
                    <animateTransform
                        attributeName="transform"
                        dur="2s"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        repeatCount="indefinite"
                    ></animateTransform>
                </line>
                <line
                    fill="none"
                    stroke-linecap="round"
                    stroke="#000"
                    stroke-width="4"
                    stroke-miterlimit="10"
                    x1="50"
                    y1="50"
                    x2="49.5"
                    y2="74"
                    transform="rotate(55.1453 50 50)"
                >
                    <animateTransform
                        attributeName="transform"
                        dur="15s"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        repeatCount="indefinite"
                    ></animateTransform>
                </line>
            </svg>
            <div class="text"><ng-content></ng-content></div>
        </div>
    `,
    styles: [
        `
            .overlay {
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background: #fff8;
                z-index: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }
            .text {
                line-height: 4rem;
                font-size: 1.2rem;
                color: #000b;
            }
        `
    ]
})
export class LoadingComponent {
    @Input()
    public show: boolean;

    @Input()
    public message: string;
}
