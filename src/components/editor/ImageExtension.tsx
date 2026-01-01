import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Image as BaseImage } from '@tiptap/extension-image';
import { useCallback, useEffect, useState, useRef } from 'react';

const ResizableImage = ({ node, updateAttributes, selected }: any) => {
    const [width, setWidth] = useState(node.attrs.width || '100%');
    const containerRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        setWidth(node.attrs.width || '100%');
    }, [node.attrs.width]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = containerRef.current ? containerRef.current.offsetWidth : 0;

        const onMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const currentWidth = startWidth + (e.clientX - startX);
            const parentWidth = containerRef.current.parentElement?.offsetWidth || 800;
            const newWidth = Math.max(100, Math.min(currentWidth, parentWidth));

            setWidth(`${newWidth}px`);
        };

        const onMouseUp = (e: MouseEvent) => {
            setIsResizing(false);
            e.preventDefault();
            e.stopPropagation();

            const currentWidth = startWidth + (e.clientX - startX);
            const parentWidth = containerRef.current?.parentElement?.offsetWidth || 800;
            // Limit min/max width
            const newWidth = Math.max(100, Math.min(currentWidth, parentWidth));

            updateAttributes({ width: `${newWidth}px` });

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [updateAttributes]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Dispatch custom event to open properties modal
        const event = new CustomEvent('open-image-properties', {
            detail: {
                attrs: node.attrs,
                updateAttributes
            }
        });
        window.dispatchEvent(event);
    };

    // Construct Styles based on attrs
    const imageStyle: React.CSSProperties = {
        borderRadius: node.attrs.borderRadius,
        borderWidth: node.attrs.borderWidth,
        borderColor: node.attrs.borderColor,
        opacity: node.attrs.opacity,
        transform: `rotate(${node.attrs.rotation}deg)`,
        boxShadow: node.attrs.hasShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
        transition: 'all 0.2s ease-in-out',
    };

    return (
        <NodeViewWrapper className="image-view relative inline-block leading-none" style={{ width: width, maxWidth: '100%' }}>
            <div
                ref={containerRef}
                className={`group relative inline-block max-w-full transition-all duration-200 ${selected || isResizing ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                onDoubleClick={handleDoubleClick}
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    className="block max-w-full h-auto"
                    style={imageStyle}
                />

                {(selected || isResizing) && (
                    <>
                        <div
                            className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize shadow-md z-10 hover:scale-125 transition-transform"
                            onMouseDown={handleMouseDown}
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded backdrop-blur-sm pointer-events-none z-20">
                            {parseInt(width as string)}px
                        </div>
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export const CustomImage = BaseImage.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: attributes => ({
                    width: attributes.width,
                    style: `width: ${attributes.width}`
                }),
                parseHTML: element => element.style.width || element.getAttribute('width'),
            },
            borderRadius: {
                default: '0px',
                parseHTML: element => element.style.borderRadius,
                renderHTML: attributes => ({ style: `border-radius: ${attributes.borderRadius}` }),
            },
            borderWidth: {
                default: '0px',
                parseHTML: element => element.style.borderWidth,
                renderHTML: attributes => ({ style: `border-width: ${attributes.borderWidth}` }),
            },
            borderColor: {
                default: '#000000',
                parseHTML: element => element.style.borderColor,
                renderHTML: attributes => ({ style: `border-color: ${attributes.borderColor}` }),
            },
            hasShadow: {
                default: false,
                parseHTML: element => element.style.boxShadow !== 'none',
                // Shadow is handled via renderHTML style or class if needed, but here we do it via style
            },
            opacity: {
                default: 1,
                parseHTML: element => parseFloat(element.style.opacity || '1'),
                renderHTML: attributes => ({ style: `opacity: ${attributes.opacity}` }),
            },
            rotation: {
                default: 0,
                parseHTML: element => {
                    const transform = element.style.transform;
                    const match = transform.match(/rotate\(([-0-9.]+)deg\)/);
                    return match ? parseFloat(match[1]) : 0;
                },
                renderHTML: attributes => ({ style: `transform: rotate(${attributes.rotation}deg)` }),
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImage);
    },
});
