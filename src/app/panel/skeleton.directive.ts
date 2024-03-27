import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
  OnChanges,
  inject,
} from '@angular/core';

type Rounding = 'none' | 'small' | 'large' | 'circle';

@Directive({
  selector: '[shadowSkeleton]',
  standalone: true,
})
export class SkeletonDirective implements OnChanges {
  @Input('shadowSkeletonWidth') width = '100%';
  @Input('shadowSkeletonHeight') height = '48px';
  @Input('shadowSkeletonRounding') rounding: Rounding = 'small';

  private element = inject(ElementRef);
  private renderer = inject(Renderer2);
  cssClass = 'dodo-skeleton';
  roundings: { [key: string]: string } = {
    none: '0',
    small: '0.5rem',
    large: '1rem',
    circle: '50%',
  };

  ngOnChanges(): void {
    const el = this.element.nativeElement;
    this.renderer.setStyle(el, 'width', this.width);
    this.renderer.setStyle(el, 'height', this.height);
    this.renderer.setStyle(el, 'border-radius', this.roundings[this.rounding]);
    this.renderer.addClass(el, this.cssClass);
  }
}
