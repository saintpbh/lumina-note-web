import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ verses: [] });
    }

    try {
        const dbPath = path.join(process.cwd(), 'src/data/bible.db');
        const db = new Database(dbPath);

        const trimmedQuery = query.trim();

        // Regex for abbreviation search: e.g. "창 1:1", "창1:1", "창세기 1:1"
        const abbrMatch = trimmedQuery.match(/^([가-힣\d]+)\s*(\d+)[:\s]+(\d+)$/);

        let verses = [];

        if (abbrMatch) {
            const [, abbr, chapter, verse] = abbrMatch;
            const stmt = db.prepare(`
                SELECT v.id, v.content, b.name as book, v.chapter, v.verse
                FROM verses v
                JOIN books b ON v.book_id = b.id
                WHERE (b.abbreviation = ? OR b.name = ?)
                  AND v.chapter = ? AND v.verse = ?
            `);
            const result = stmt.all(abbr, abbr, parseInt(chapter), parseInt(verse));
            verses = result;
        } else {
            // Keyword search
            const stmt = db.prepare(`
                SELECT v.id, v.content, b.name as book, v.chapter, v.verse
                FROM verses v
                JOIN books b ON v.book_id = b.id
                WHERE v.content LIKE ?
                ORDER BY b.id, v.chapter, v.verse
                LIMIT 100
            `);
            verses = stmt.all(`%${trimmedQuery}%`);
        }

        db.close();
        return NextResponse.json({ verses });
    } catch (error) {
        console.error('Bible search API error:', error);
        return NextResponse.json({ error: 'Failed to search Bible', details: String(error) }, { status: 500 });
    }
}
