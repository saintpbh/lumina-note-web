import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

const PageBreakView = ({ node }: { node: any }) => {
    const pageNumber = node.attrs.pageNumber;
    return (
        <NodeViewWrapper className="page-break-wrapper">
            <div className="page-break-line" contentEditable={false}>
                <div className="page-break-text">
                    PAGE BREAK {pageNumber && <span className="ml-1 opacity-70">| PAGE {pageNumber}</span>}
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export const PageBreak = Node.create({
    name: 'pageBreak',

    group: 'block',

    addAttributes() {
        return {
            pageNumber: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="page-break"]',
                getAttrs: (element) => ({
                    pageNumber: element.getAttribute('data-page-number') || null,
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'page-break',
            'data-page-number': HTMLAttributes.pageNumber,
            class: 'page-break-print-signal'
        })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PageBreakView);
    },

    addCommands() {
        return {
            setPageBreak: (attrs?: { pageNumber?: number | string }) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: attrs || {},
                });
            },
        };
    },
});

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageBreak: {
            setPageBreak: (attrs?: { pageNumber?: number | string }) => ReturnType;
        };
    }
}
