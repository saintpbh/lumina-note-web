import { Node, mergeAttributes } from '@tiptap/core';

export const PageSpacer = Node.create({
    name: 'pageSpacer',

    group: 'block',

    atom: true,
    draggable: false,

    addAttributes() {
        return {
            height: {
                default: '25mm',
            },
            pageNumber: {
                default: null,
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="page-spacer"]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const pageLabel = node.attrs.pageNumber ? `PAGE BREAK | PAGE ${node.attrs.pageNumber}` : 'PAGE BREAK';

        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'page-spacer',
            class: 'page-spacer select-none pointer-events-none relative flex items-center justify-center',
            style: `--spacer-height: ${HTMLAttributes.height || '25mm'}; height: var(--spacer-height);`
        }),
            ['div', {
                class: 'absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none'
            },
                ['div', { class: 'w-full border-t border-solid border-gray-200 dark:border-gray-800' }]
            ],
            ['div', {
                class: 'px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold luxury-mono uppercase tracking-[0.2em] theme-text-muted border border-gray-200 dark:border-gray-700 shadow-sm z-10'
            }, pageLabel]
        ];
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Enter': () => {
                // Height and page number logic handled in Editor.tsx to access state
                return false;
            },
        };
    },
});
