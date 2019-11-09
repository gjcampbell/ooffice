import { VirtualRenderArea } from './virtual-render-area';

describe('VirtualRenderArea', () => {
    const createVra = () => {
        const result = new VirtualRenderArea();
        result.itemCount = 2000;
        result.itemHeight = 20;
        result.viewerHeight = 295;
        result.scrollPos = 0;
        return result;
    };

    it('provides calculations for rendering virtual scrolled data', () => {
        const vra = createVra();

        expect(vra.topBuffer).toBe(0);
        expect(vra.totalHeight).toBe(40000);
        expect(vra.visibleStart).toBe(0);
        expect(vra.visibleCount).toBe(16);
    });

    it('updates calculations after scroll', () => {
        const vra = createVra();
        vra.scrollPos = 50;

        expect(vra.topBuffer).toBe(40);
        expect(vra.totalHeight).toBe(40000);
        expect(vra.visibleStart).toBe(2);
        expect(vra.visibleCount).toBe(16);
    });

    it('updates calculations viewer height change', () => {
        const vra = createVra();
        vra.viewerHeight = 200;

        expect(vra.topBuffer).toBe(0);
        expect(vra.totalHeight).toBe(40000);
        expect(vra.visibleStart).toBe(0);
        expect(vra.visibleCount).toBe(11);
    });

    it('updates calculations item height change', () => {
        const vra = createVra();
        vra.scrollPos = 60;
        vra.itemHeight = 25;

        expect(vra.topBuffer).toBe(50);
        expect(vra.totalHeight).toBe(50000);
        expect(vra.visibleStart).toBe(2);
        expect(vra.visibleCount).toBe(13);
    });

    it('updates calculations item height change scrolled', () => {
        const vra = createVra();
        vra.scrollPos = 60;
        vra.itemHeight = 25;

        expect(vra.topBuffer).toBe(50);
        expect(vra.totalHeight).toBe(50000);
        expect(vra.visibleStart).toBe(2);
        expect(vra.visibleCount).toBe(13);
    });

    it('updates calculations item count change', () => {
        const vra = createVra();
        vra.itemCount = 1500;

        expect(vra.topBuffer).toBe(0);
        expect(vra.totalHeight).toBe(30000);
        expect(vra.visibleStart).toBe(0);
        expect(vra.visibleCount).toBe(16);
    });
});
