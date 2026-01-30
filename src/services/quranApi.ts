/**
 * Quran API Service
 * Uses Quran.com API v4 for Quran text, translation, and audio
 * Documentation: https://api-docs.quran.com/
 */

const API_BASE = 'https://api.quran.com/api/v4';
const AUDIO_CDN = 'https://verses.quran.com/';

// Reciter IDs for the new API
export const RECITERS = {
    'mishary-rashid': 7,    // Mishari Rashid al-`Afasy
    'abdul-basit': 2,       // AbdulBaset AbdulSamad (Murattal)
    'sudais': 3,            // Abdur-Rahman as-Sudais
    'minshawi': 9,          // Mohamed Siddiq al-Minshawi (Murattal)
    'husary': 6,            // Mahmoud Khalil Al-Husary
    'ghamdi': 4,            // Abu Bakr al-Shatri (closest available)
} as const;

// Translation IDs
export const TRANSLATIONS = {
    en: 20,  // Saheeh International
    ha: 32,  // Abubakar Mahmoud Gumi (Hausa)
} as const;

// Types for the new API

export interface Chapter {
    id: number;
    revelation_place: 'makkah' | 'madinah';
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: [number, number];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export interface Verse {
    id: number;
    verse_number: number;
    verse_key: string;
    hizb_number: number;
    rub_el_hizb_number: number;
    ruku_number: number;
    manzil_number: number;
    sajdah_number: number | null;
    page_number: number;
    juz_number: number;
    text_uthmani?: string;
    text_qpc_hafs?: string;
    translations?: Translation[];
    words?: Word[];
}

export interface Word {
    id: number;
    position: number;
    audio_url: string | null;
    char_type_name: string;
    text_qpc_hafs: string;
    line_number: number;
}

export interface Translation {
    id: number;
    text: string;
    resource_id: number;
    resource_name: string;
}

export interface AudioFile {
    verse_key: string;
    url: string;
}

export interface Juz {
    id: number;
    juz_number: number;
    verse_mapping: { [chapterId: string]: string };
    first_verse_id: number;
    last_verse_id: number;
    verses_count: number;
}

export interface PaginationMeta {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
}

// Legacy type aliases for backward compatibility
export interface SurahMeta {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
    audio?: string;
    audioSecondary?: string[];
    translation?: string;
}

export interface SurahData {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: 'Meccan' | 'Medinan';
    numberOfAyahs: number;
    ayahs: Ayah[];
}

export interface PageData {
    number: number;
    ayahs: Ayah[];
    surahs: { [key: number]: string };
}

export interface JuzData {
    number: number;
    ayahs: Ayah[];
    surahs: { [key: number]: string };
}

// API Functions

/**
 * Fetch all 114 chapters
 */
export async function fetchAllChapters(): Promise<Chapter[]> {
    try {
        const response = await fetch(`${API_BASE}/chapters`);
        const json = await response.json();
        return json.chapters;
    } catch (error) {
        console.error('Failed to fetch chapters:', error);
        throw error;
    }
}

/**
 * Fetch a specific chapter by ID
 */
export async function fetchChapter(chapterId: number): Promise<Chapter> {
    try {
        const response = await fetch(`${API_BASE}/chapters/${chapterId}`);
        const json = await response.json();
        return json.chapter;
    } catch (error) {
        console.error(`Failed to fetch chapter ${chapterId}:`, error);
        throw error;
    }
}

/**
 * Fetch Arabic text for a chapter using Uthmani script
 */
export async function fetchArabicText(chapterNumber: number): Promise<{ id: number; verse_key: string; text_uthmani: string }[]> {
    try {
        const response = await fetch(`${API_BASE}/quran/verses/uthmani?chapter_number=${chapterNumber}`);
        const json = await response.json();
        return json.verses;
    } catch (error) {
        console.error(`Failed to fetch Arabic text for chapter ${chapterNumber}:`, error);
        throw error;
    }
}

/**
 * Fetch verses by chapter with optional translations
 */
export async function fetchVersesByChapter(
    chapterNumber: number,
    translationId: number = TRANSLATIONS.en,
    page: number = 1,
    perPage: number = 50
): Promise<{ verses: Verse[]; pagination: PaginationMeta }> {
    try {
        const url = `${API_BASE}/verses/by_chapter/${chapterNumber}?translations=${translationId}&fields=text_qpc_hafs&page=${page}&per_page=${perPage}`;
        const response = await fetch(url);
        const json = await response.json();
        return {
            verses: json.verses,
            pagination: json.pagination
        };
    } catch (error) {
        console.error(`Failed to fetch verses for chapter ${chapterNumber}:`, error);
        throw error;
    }
}

/**
 * Fetch all verses for a chapter (handles pagination automatically)
 */
export async function fetchAllVersesByChapter(
    chapterNumber: number,
    translationId: number = TRANSLATIONS.en
): Promise<Verse[]> {
    const allVerses: Verse[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
        const { verses, pagination } = await fetchVersesByChapter(chapterNumber, translationId, currentPage, 50);
        allVerses.push(...verses);
        hasMore = pagination.next_page !== null;
        currentPage++;
    }

    return allVerses;
}

/**
 * Fetch audio files for a chapter by reciter
 */
export async function fetchVerseAudio(
    reciterId: number,
    chapterNumber: number
): Promise<AudioFile[]> {
    try {
        // Use per_page=300 to ensure we get all verses (max chapter is 286 verses in Al-Baqarah)
        const response = await fetch(`${API_BASE}/recitations/${reciterId}/by_chapter/${chapterNumber}?per_page=300`);
        const json = await response.json();
        console.log(`Fetched ${json.audio_files?.length || 0} audio files for chapter ${chapterNumber}`);
        return json.audio_files || [];
    } catch (error) {
        console.error(`Failed to fetch audio for chapter ${chapterNumber}:`, error);
        throw error;
    }
}

/**
 * Fetch all juzs
 */
export async function fetchAllJuzs(): Promise<Juz[]> {
    try {
        const response = await fetch(`${API_BASE}/juzs`);
        const json = await response.json();
        // Filter out duplicates (API returns duplicates)
        const seenJuzNumbers = new Set<number>();
        return json.juzs.filter((juz: Juz) => {
            if (seenJuzNumbers.has(juz.juz_number)) {
                return false;
            }
            seenJuzNumbers.add(juz.juz_number);
            return true;
        });
    } catch (error) {
        console.error('Failed to fetch juzs:', error);
        throw error;
    }
}

/**
 * Fetch verses by juz number
 */
export async function fetchVersesByJuz(
    juzNumber: number,
    translationId: number = TRANSLATIONS.en,
    page: number = 1,
    perPage: number = 50
): Promise<{ verses: Verse[]; pagination: PaginationMeta }> {
    try {
        const url = `${API_BASE}/verses/by_juz/${juzNumber}?translations=${translationId}&page=${page}&per_page=${perPage}`;
        const response = await fetch(url);
        const json = await response.json();
        return {
            verses: json.verses,
            pagination: json.pagination
        };
    } catch (error) {
        console.error(`Failed to fetch verses for juz ${juzNumber}:`, error);
        throw error;
    }
}

/**
 * Fetch verses by page number
 */
export async function fetchVersesByPage(
    pageNumber: number,
    translationId: number = TRANSLATIONS.en
): Promise<{ verses: Verse[]; pagination: PaginationMeta }> {
    try {
        const url = `${API_BASE}/verses/by_page/${pageNumber}?translations=${translationId}`;
        const response = await fetch(url);
        const json = await response.json();
        return {
            verses: json.verses,
            pagination: json.pagination
        };
    } catch (error) {
        console.error(`Failed to fetch verses for page ${pageNumber}:`, error);
        throw error;
    }
}

/**
 * Fetch a random verse
 */
export async function fetchRandomVerse(translationId: number = TRANSLATIONS.en): Promise<Verse> {
    try {
        const response = await fetch(`${API_BASE}/verses/random?translations=${translationId}`);
        const json = await response.json();
        return json.verse;
    } catch (error) {
        console.error('Failed to fetch random verse:', error);
        throw error;
    }
}

/**
 * Fetch a specific verse by key (e.g., "2:255")
 */
export async function fetchVerseByKey(
    verseKey: string,
    translationId: number = TRANSLATIONS.en
): Promise<Verse> {
    try {
        const response = await fetch(`${API_BASE}/verses/by_key/${verseKey}?translations=${translationId}`);
        const json = await response.json();
        return json.verse;
    } catch (error) {
        console.error(`Failed to fetch verse ${verseKey}:`, error);
        throw error;
    }
}

/**
 * Get full audio URL from relative path
 */
export function getFullAudioUrl(relativePath: string): string {
    return `${AUDIO_CDN}${relativePath}`;
}

/**
 * Get reciter ID from reciter name
 */
export function getReciterId(reciterName: string): number {
    return RECITERS[reciterName as keyof typeof RECITERS] || RECITERS['mishary-rashid'];
}

/**
 * Get translation ID from language code
 */
export function getTranslationId(languageCode: string): number {
    return TRANSLATIONS[languageCode as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
}

// ==============================================
// PAGE-BASED API FUNCTIONS
// ==============================================

// Juz to first page mapping (Juz 1 starts at page 1, Juz 2 at page 22, etc.)
export const JUZ_PAGE_MAP: { [juz: number]: number } = {
    1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 121, 8: 142, 9: 162, 10: 182,
    11: 201, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342,
    19: 362, 20: 382, 21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502,
    27: 522, 28: 542, 29: 562, 30: 582
};

/**
 * Get the first page number for a juz
 */
export function getJuzStartPage(juzNumber: number): number {
    return JUZ_PAGE_MAP[juzNumber] || 1;
}

/**
 * Get the first page number for a chapter (surah)
 */
export async function getChapterStartPage(chapterNumber: number): Promise<number> {
    const chapter = await fetchChapter(chapterNumber);
    return chapter.pages[0];
}

/**
 * Fetch complete page data with verses, translations, and metadata
 */
export interface QuranPageData {
    pageNumber: number;
    verses: Verse[];
    chapters: { id: number; name: string; nameArabic: string }[];
    juzNumber: number;
    hizbNumber: number;
}

export async function fetchPageData(
    pageNumber: number,
    translationId: number = TRANSLATIONS.en
): Promise<QuranPageData> {
    try {
        const url = `${API_BASE}/verses/by_page/${pageNumber}?words=true&translations=${translationId}&fields=text_qpc_hafs&word_fields=text_qpc_hafs,line_number`;
        const response = await fetch(url);
        const json = await response.json();

        const verses: Verse[] = json.verses;

        // Extract unique chapters from verses
        const chapterIds = [...new Set(verses.map(v => parseInt(v.verse_key.split(':')[0])))];

        // Fetch chapter info for each unique chapter on this page
        const chaptersInfo = await Promise.all(
            chapterIds.map(async (id) => {
                const chapter = await fetchChapter(id);
                return {
                    id: chapter.id,
                    name: chapter.name_simple,
                    nameArabic: chapter.name_arabic
                };
            })
        );

        return {
            pageNumber,
            verses,
            chapters: chaptersInfo,
            juzNumber: verses[0]?.juz_number || 1,
            hizbNumber: verses[0]?.hizb_number || 1
        };
    } catch (error) {
        console.error(`Failed to fetch page ${pageNumber}:`, error);
        throw error;
    }
}

/**
 * Fetch audio for all verses on a page
 */
// Cache for chapter audio to avoid repeated large API calls
const audioCache: { [key: string]: AudioFile[] } = {};

export async function fetchPageAudio(
    pageNumber: number,
    reciterId: number = RECITERS['mishary-rashid']
): Promise<{ verseKey: string; audioUrl: string }[]> {
    try {
        // First get the verses on this page to know which chapters we need
        const { verses } = await fetchVersesByPage(pageNumber);
        console.log('Page verses:', verses.map(v => v.verse_key));

        // Get unique chapter numbers
        const chapterNumbers = [...new Set(verses.map(v => parseInt(v.verse_key.split(':')[0])))];
        console.log('Chapters on page:', chapterNumbers);

        // Fetch audio for each chapter (using cache) and filter to only verses on this page
        const allAudio: { verseKey: string; audioUrl: string }[] = [];

        for (const chapterNum of chapterNumbers) {
            const cacheKey = `${reciterId}-${chapterNum}`;

            let audioFiles: AudioFile[];
            if (audioCache[cacheKey]) {
                console.log('Using cached audio for chapter:', chapterNum);
                audioFiles = audioCache[cacheKey];
            } else {
                try {
                    console.log('Fetching fresh audio for chapter:', chapterNum);
                    audioFiles = await fetchVerseAudio(reciterId, chapterNum);
                    audioCache[cacheKey] = audioFiles; // Cache the result
                    console.log('Cached', audioFiles.length, 'audio files for chapter', chapterNum);
                } catch (err) {
                    console.error(`Failed to fetch audio for chapter ${chapterNum}, skipping...`);
                    continue; // Skip this chapter if audio fetch fails
                }
            }

            console.log('Audio files sample:', audioFiles.slice(0, 3).map(a => a.verse_key));

            for (const verse of verses) {
                const verseChapter = parseInt(verse.verse_key.split(':')[0]);
                if (verseChapter !== chapterNum) continue;

                const audioFile = audioFiles.find(a => a.verse_key === verse.verse_key);
                if (audioFile) {
                    allAudio.push({
                        verseKey: verse.verse_key,
                        audioUrl: getFullAudioUrl(audioFile.url)
                    });
                } else {
                    console.log('No audio found for verse:', verse.verse_key);
                }
            }
        }

        console.log('Total audio files matched:', allAudio.length);
        return allAudio;
    } catch (error) {
        console.error(`Failed to fetch audio for page ${pageNumber}:`, error);
        return []; // Return empty array instead of throwing to prevent UI breaking
    }
}

// ==============================================
// LEGACY ADAPTER FUNCTIONS
// These functions provide backward compatibility with the old API interface
// ==============================================

/**
 * Convert Chapter to SurahMeta (legacy format)
 */
function chapterToSurahMeta(chapter: Chapter): SurahMeta {
    return {
        number: chapter.id,
        name: chapter.name_arabic,
        englishName: chapter.name_simple,
        englishNameTranslation: chapter.translated_name.name,
        numberOfAyahs: chapter.verses_count,
        revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'
    };
}


/**
 * Fetch metadata for all 114 surahs (legacy compatibility)
 */
export async function fetchAllSurahs(): Promise<SurahMeta[]> {
    const chapters = await fetchAllChapters();
    return chapters.map(chapterToSurahMeta);
}

/**
 * Fetch a complete surah with all ayahs (legacy compatibility)
 */
export async function fetchSurah(surahNumber: number): Promise<SurahData> {
    const [chapter, arabicVerses] = await Promise.all([
        fetchChapter(surahNumber),
        fetchArabicText(surahNumber)
    ]);

    const ayahs: Ayah[] = arabicVerses.map((v, index) => ({
        number: v.id,
        text: v.text_uthmani,
        numberInSurah: index + 1,
        juz: 0,
        manzil: 0,
        page: 0,
        ruku: 0,
        hizbQuarter: 0,
        sajda: false
    }));

    return {
        number: chapter.id,
        name: chapter.name_arabic,
        englishName: chapter.name_simple,
        englishNameTranslation: chapter.translated_name.name,
        revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
        numberOfAyahs: chapter.verses_count,
        ayahs
    };
}

/**
 * Fetch a surah with both Arabic text and translation (legacy compatibility)
 */
export async function fetchSurahWithTranslation(
    surahNumber: number,
    translationLang: string = 'en'
): Promise<{ arabic: SurahData; translation: SurahData }> {
    const translationId = getTranslationId(translationLang);

    const [chapter, arabicVerses, versesWithTranslation] = await Promise.all([
        fetchChapter(surahNumber),
        fetchArabicText(surahNumber),
        fetchAllVersesByChapter(surahNumber, translationId)
    ]);

    const arabicAyahs: Ayah[] = arabicVerses.map((v, index) => {
        const verseData = versesWithTranslation[index];
        return {
            number: v.id,
            text: v.text_uthmani,
            numberInSurah: index + 1,
            juz: verseData?.juz_number || 0,
            manzil: verseData?.manzil_number || 0,
            page: verseData?.page_number || 0,
            ruku: verseData?.ruku_number || 0,
            hizbQuarter: verseData?.rub_el_hizb_number || 0,
            sajda: verseData?.sajdah_number !== null && verseData?.sajdah_number !== undefined
        };
    });

    const translationAyahs: Ayah[] = versesWithTranslation.map((v) => ({
        number: v.id,
        text: v.translations?.[0]?.text || '',
        numberInSurah: v.verse_number,
        juz: v.juz_number,
        manzil: v.manzil_number,
        page: v.page_number,
        ruku: v.ruku_number,
        hizbQuarter: v.rub_el_hizb_number,
        sajda: v.sajdah_number !== null
    }));

    const baseSurahData = {
        number: chapter.id,
        name: chapter.name_arabic,
        englishName: chapter.name_simple,
        englishNameTranslation: chapter.translated_name.name,
        revelationType: (chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan') as 'Meccan' | 'Medinan',
        numberOfAyahs: chapter.verses_count
    };

    return {
        arabic: { ...baseSurahData, ayahs: arabicAyahs },
        translation: { ...baseSurahData, ayahs: translationAyahs }
    };
}

/**
 * Fetch a surah with audio (legacy compatibility)
 */
export async function fetchSurahWithAudio(
    surahNumber: number,
    reciterName: string = 'mishary-rashid'
): Promise<SurahData> {
    const reciterId = getReciterId(reciterName);

    const [chapter, arabicVerses, audioFiles] = await Promise.all([
        fetchChapter(surahNumber),
        fetchArabicText(surahNumber),
        fetchVerseAudio(reciterId, surahNumber)
    ]);

    const ayahs: Ayah[] = arabicVerses.map((v, index) => {
        const audioFile = audioFiles[index];
        return {
            number: v.id,
            text: v.text_uthmani,
            numberInSurah: index + 1,
            juz: 0,
            manzil: 0,
            page: 0,
            ruku: 0,
            hizbQuarter: 0,
            sajda: false,
            audio: audioFile ? getFullAudioUrl(audioFile.url) : undefined
        };
    });

    return {
        number: chapter.id,
        name: chapter.name_arabic,
        englishName: chapter.name_simple,
        englishNameTranslation: chapter.translated_name.name,
        revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
        numberOfAyahs: chapter.verses_count,
        ayahs
    };
}

/**
 * Fetch a page with translation (legacy compatibility)
 */
export async function fetchPageWithTranslation(
    pageNumber: number,
    translationLang: string = 'en'
): Promise<{ arabic: PageData; translation: PageData }> {
    const translationId = getTranslationId(translationLang);

    const [arabicResponse, translationResponse] = await Promise.all([
        fetch(`${API_BASE}/quran/verses/uthmani?page_number=${pageNumber}`),
        fetchVersesByPage(pageNumber, translationId)
    ]);

    const arabicJson = await arabicResponse.json();
    const arabicVerses = arabicJson.verses;

    const arabicAyahs: Ayah[] = arabicVerses.map((v: { id: number; verse_key: string; text_uthmani: string }, index: number) => {
        const verseData = translationResponse.verses[index];
        return {
            number: v.id,
            text: v.text_uthmani,
            numberInSurah: parseInt(v.verse_key.split(':')[1]),
            juz: verseData?.juz_number || 0,
            manzil: verseData?.manzil_number || 0,
            page: verseData?.page_number || pageNumber,
            ruku: verseData?.ruku_number || 0,
            hizbQuarter: verseData?.rub_el_hizb_number || 0,
            sajda: false
        };
    });

    const translationAyahs: Ayah[] = translationResponse.verses.map((v) => ({
        number: v.id,
        text: v.translations?.[0]?.text || '',
        numberInSurah: v.verse_number,
        juz: v.juz_number,
        manzil: v.manzil_number,
        page: v.page_number,
        ruku: v.ruku_number,
        hizbQuarter: v.rub_el_hizb_number,
        sajda: v.sajdah_number !== null
    }));

    // Extract unique surahs from verses
    const surahs: { [key: number]: string } = {};
    translationResponse.verses.forEach((v) => {
        const surahNum = parseInt(v.verse_key.split(':')[0]);
        if (!surahs[surahNum]) {
            surahs[surahNum] = `Surah ${surahNum}`;
        }
    });

    return {
        arabic: { number: pageNumber, ayahs: arabicAyahs, surahs },
        translation: { number: pageNumber, ayahs: translationAyahs, surahs }
    };
}

/**
 * Fetch a juz with translation (legacy compatibility)
 */
export async function fetchJuzWithTranslation(
    juzNumber: number,
    translationLang: string = 'en'
): Promise<{ arabic: JuzData; translation: JuzData }> {
    const translationId = getTranslationId(translationLang);

    // Fetch all verses for the juz (handling pagination)
    const allVerses: Verse[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
        const { verses, pagination } = await fetchVersesByJuz(juzNumber, translationId, currentPage, 50);
        allVerses.push(...verses);
        hasMore = pagination.next_page !== null;
        currentPage++;
    }

    // Fetch Arabic text for each unique chapter in the juz
    const chapterNumbers = [...new Set(allVerses.map(v => parseInt(v.verse_key.split(':')[0])))];
    const arabicTextsByChapter: { [chapterNum: number]: { id: number; verse_key: string; text_uthmani: string }[] } = {};

    await Promise.all(chapterNumbers.map(async (chapterNum) => {
        arabicTextsByChapter[chapterNum] = await fetchArabicText(chapterNum);
    }));

    const arabicAyahs: Ayah[] = allVerses.map((v) => {
        const [chapterNum, verseNum] = v.verse_key.split(':').map(Number);
        const arabicTexts = arabicTextsByChapter[chapterNum] || [];
        const arabicVerse = arabicTexts.find(av => av.verse_key === v.verse_key);

        return {
            number: v.id,
            text: arabicVerse?.text_uthmani || '',
            numberInSurah: verseNum,
            juz: v.juz_number,
            manzil: v.manzil_number,
            page: v.page_number,
            ruku: v.ruku_number,
            hizbQuarter: v.rub_el_hizb_number,
            sajda: v.sajdah_number !== null
        };
    });

    const translationAyahs: Ayah[] = allVerses.map((v) => ({
        number: v.id,
        text: v.translations?.[0]?.text || '',
        numberInSurah: v.verse_number,
        juz: v.juz_number,
        manzil: v.manzil_number,
        page: v.page_number,
        ruku: v.ruku_number,
        hizbQuarter: v.rub_el_hizb_number,
        sajda: v.sajdah_number !== null
    }));

    // Extract unique surahs
    const surahs: { [key: number]: string } = {};
    allVerses.forEach((v) => {
        const surahNum = parseInt(v.verse_key.split(':')[0]);
        if (!surahs[surahNum]) {
            surahs[surahNum] = `Surah ${surahNum}`;
        }
    });

    return {
        arabic: { number: juzNumber, ayahs: arabicAyahs, surahs },
        translation: { number: juzNumber, ayahs: translationAyahs, surahs }
    };
}

/**
 * Combine Arabic and translation ayahs (legacy compatibility)
 */
export function combineWithTranslation(
    arabicAyahs: Ayah[],
    translationAyahs: Ayah[]
): (Ayah & { translation: string })[] {
    return arabicAyahs.map((ayah, index) => ({
        ...ayah,
        translation: translationAyahs[index]?.text || ''
    }));
}

/**
 * Get audio URL for a specific ayah (legacy compatibility)
 */
export function getAudioUrl(
    surahNumber: number,
    ayahNumber: number,
    reciterName: string = 'mishary-rashid'
): string {
    // This returns a formatted URL that matches the CDN pattern
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');

    // Map reciter names to folder names
    const reciterFolders: { [key: string]: string } = {
        'mishary-rashid': 'Alafasy',
        'abdul-basit': 'Abdul_Basit_Murattal_64kbps',
        'sudais': 'Sudais_64kbps',
        'minshawi': 'Minshawy_Murattal_128kbps',
        'husary': 'Husary_64kbps'
    };

    const folder = reciterFolders[reciterName] || 'Alafasy';
    return `${AUDIO_CDN}${folder}/mp3/${paddedSurah}${paddedAyah}.mp3`;
}

// ==============================================
// OFFLINE-FIRST FUNCTIONS
// ==============================================

import {
    getAudioBlob,
    savePageData as savePageDataToCache,
    getPageData as getPageDataFromCache
} from './indexedDbService';

/**
 * Fetch audio for a page with offline-first approach
 * Checks IndexedDB first, then falls back to API
 */
export async function fetchPageAudioOfflineFirst(
    pageNumber: number,
    reciterId: number = RECITERS['mishary-rashid']
): Promise<{ verseKey: string; audioUrl: string }[]> {
    try {
        // First get page verses to know what we need
        const { verses } = await fetchVersesByPage(pageNumber);
        const result: { verseKey: string; audioUrl: string }[] = [];
        const versesToFetch: string[] = [];

        // Check each verse for local audio
        for (const verse of verses) {
            const localBlob = await getAudioBlob(verse.verse_key, reciterId);
            if (localBlob) {
                // Create object URL from cached blob
                const blobUrl = URL.createObjectURL(localBlob);
                result.push({ verseKey: verse.verse_key, audioUrl: blobUrl });
            } else {
                versesToFetch.push(verse.verse_key);
            }
        }

        // If all audio is cached, return immediately
        if (versesToFetch.length === 0) {
            console.log('All audio loaded from cache for page', pageNumber);
            return result;
        }

        // Fetch missing audio from API
        console.log('Fetching', versesToFetch.length, 'audio files from API for page', pageNumber);
        const apiAudio = await fetchPageAudio(pageNumber, reciterId);

        // Merge API results for verses not in cache
        for (const audio of apiAudio) {
            if (versesToFetch.includes(audio.verseKey)) {
                result.push(audio);
            }
        }

        return result;
    } catch (error) {
        console.error(`Failed to fetch audio for page ${pageNumber}:`, error);
        // Fall back to regular API call
        return fetchPageAudio(pageNumber, reciterId);
    }
}

/**
 * Fetch page data with offline-first approach
 * Checks IndexedDB cache first, then falls back to API
 */
export async function fetchPageDataOfflineFirst(
    pageNumber: number,
    translationLang: 'en' | 'ha' = 'en'
): Promise<QuranPageData> {
    try {
        // Check cache first
        const cachedData = await getPageDataFromCache(pageNumber, translationLang);
        if (cachedData) {
            console.log('Page data loaded from cache for page', pageNumber, 'lang:', translationLang);
            return cachedData as QuranPageData;
        }

        // Fetch from API
        console.log('Fetching page data from API for page', pageNumber, 'lang:', translationLang);
        const translationId = getTranslationId(translationLang);
        const data = await fetchPageData(pageNumber, translationId);

        // Save to cache for future use
        try {
            await savePageDataToCache(pageNumber, data, translationLang);
        } catch (cacheError) {
            console.warn('Failed to cache page data:', cacheError);
        }

        return data;
    } catch (error) {
        console.error(`Failed to fetch page data for page ${pageNumber}:`, error);
        throw error;
    }
}
