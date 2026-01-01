import { Extension, Node, mergeAttributes, RawCommands } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        lineHeight: {
            setLineHeight: (lineHeight: string) => ReturnType;
            unsetLineHeight: () => ReturnType;
        };
        letterSpacing: {
            setLetterSpacing: (letterSpacing: string) => ReturnType;
        };
    }
}

export const LineHeight = Extension.create({
    name: 'lineHeight',

    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            defaultLineHeight: '1.5',
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: this.options.defaultLineHeight,
                        parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight) return {};
                            return { style: `line-height: ${attributes.lineHeight}` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setLineHeight: (lineHeight: string) => ({ commands }) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }));
            },
            unsetLineHeight: () => ({ commands }) => {
                return this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight'));
            },
        } as Partial<RawCommands>;
    },
});

export const LetterSpacing = Extension.create({
    name: 'letterSpacing',

    addOptions() {
        return {
            types: ['paragraph', 'heading', 'textStyle'],
            defaultLetterSpacing: 'normal',
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    letterSpacing: {
                        default: this.options.defaultLetterSpacing,
                        parseHTML: element => element.style.letterSpacing || this.options.defaultLetterSpacing,
                        renderHTML: attributes => {
                            if (!attributes.letterSpacing) return {};
                            return { style: `letter-spacing: ${attributes.letterSpacing}` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setLetterSpacing: (letterSpacing: string) => ({ commands }) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { letterSpacing }));
            },
        } as Partial<RawCommands>;
    },
});

export const Footnote = Node.create({
    name: 'footnote',
    group: 'inline',
    inline: true,
    content: 'text*',
    atom: true, // Set to true to make it a leaf node (non-editable number)

    addAttributes() {
        return {
            number: {
                default: 1,
            },
        };
    },

    parseHTML() {
        return [{ tag: 'sup[data-type="footnote"]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'sup',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'footnote',
                'data-number': node.attrs.number,
                class: 'footnote-ref cursor-pointer font-bold ml-0.5 px-0.5 rounded transition-all',
                style: `color: var(--accent-color);`,
                onclick: `window.dispatchEvent(new CustomEvent('jump-to-footnote', { detail: ${node.attrs.number} }))`
            }),
            node.attrs.number.toString()
        ];
    },
});
