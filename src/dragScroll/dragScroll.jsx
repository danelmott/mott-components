'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { verifyTypesDragScroll } from '../utils/verifyTypes.js';

gsap.registerPlugin(Draggable, InertiaPlugin);


const DRAG_TYPE = { y: 'scrollTop', x: 'scrollLeft', both: 'scroll' };


const EDGE_RESISTANCE = 0.85;


export function useDragScroll(ref, { axis = 'y', inertia = true, disabled = false } = {}) {
    useEffect(() => {
        if (disabled || !ref.current) return;
        
        if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;
        
        const el = ref.current;
        let draggable = null;
        
        const overflows = () => (axis === 'x'
            ? el.scrollWidth > el.clientWidth
            : axis === 'both'
                ? el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
                : el.scrollHeight > el.clientHeight);
        
        
        const sync = () => {
            if (overflows() && !draggable) {
                [draggable] = Draggable.create(el, {
                    type: DRAG_TYPE[axis] ?? DRAG_TYPE.y,
                    inertia,
                    edgeResistance: EDGE_RESISTANCE,
                    minimumMovement: 3,
                    dragClickables: true,
                    cursor: 'grab',
                    activeCursor: 'grabbing',
                });
            } else if (!overflows() && draggable) {
                draggable.kill();
                draggable = null;
                el.style.cursor = '';
            }
        };
        
        sync();
        const observer = new ResizeObserver(sync);
        observer.observe(el);
        if (el.firstElementChild) observer.observe(el.firstElementChild);
        
        return () => {
            observer.disconnect();
            draggable?.kill();
            el.style.cursor = '';
        };
    }, [ref, axis, inertia, disabled]);
}


function useEdgeFade(ref, axis, size) {
    const [edges, setEdges] = useState([0, 0]);
    
    const measure = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        
        const horizontal = axis === 'x';
        const pos = horizontal ? el.scrollLeft : el.scrollTop;
        const total = horizontal ? el.scrollWidth : el.scrollHeight;
        const visible = horizontal ? el.clientWidth : el.clientHeight;
        const remaining = total - visible - pos;
        
        setEdges([Math.min(pos, size), Math.min(Math.max(remaining, 0), size)]);
    }, [ref, axis, size]);
    
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        
        measure();
        el.addEventListener('scroll', measure, { passive: true });
        
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        if (el.firstElementChild) observer.observe(el.firstElementChild);
        
        return () => {
            el.removeEventListener('scroll', measure);
            observer.disconnect();
        };
    }, [ref, measure]);
    
    return edges;
}

export default function DragScroll({
    children,
    axis = 'y',
    inertia = true,
    disabled = false,
    fade = true,
    fadeSize,
    className,
    style,
    ...props
}) {
    verifyTypesDragScroll({ axis, inertia, disabled, fade, fadeSize });
    
    const scrollRef = useRef(null);
    useDragScroll(scrollRef, { axis, inertia, disabled });
    
    const size = fadeSize ?? 32;
    const [fadeStart, fadeEnd] = useEdgeFade(scrollRef, axis, fade ? size : 0);
    
    const horizontal = axis === 'x';
    
    return (
        <div
            ref={scrollRef}
            className={twMerge(fade && (horizontal ? 'mott-fade-x' : 'mott-fade-y'), className)}
            style={{
                overflowX: horizontal || axis === 'both' ? 'auto' : 'hidden',
                overflowY: horizontal ? 'hidden' : 'auto',
                '--mott-fade-start': `${fadeStart}px`,
                '--mott-fade-end': `${fadeEnd}px`,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
}
