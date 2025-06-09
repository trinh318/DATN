export function formatSummaryMarkdown(summary) {
    const jsonRegex = /```json\s*({[\s\S]*?})\s*```/;
    const jsonMatch = summary.match(jsonRegex);

    let markdown = summary
        .replace(/\n{2,}/g, '\n\n')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/JSON format:/, '')
        .replace(/\*\*Analysis Summary:\*\*/, '')
        .replace(/Analysis Summary:/, '')
        .replace(/\*\*JSON Output:\*\*/, '')
        .replace(/JSON Output:/, '')
        .replace(/Step 1:/, '**Step 1: Skills and Qualification Matching**')
        .replace(/Step 2:/, '**Step 2: Scoring**')
        .replace(/Step 3:/, '**Step 3: Analysis Summary**')
        .replace(/- \*\*Matching soft skills:\*\*/, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Matching soft skills:*')
        .replace(/- \*\*Matching hard skills:\*\*/, '\n\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Matching hard skills:*')
        .replace(/- \*\*Relevant experiences for the position:\*\*/, '\n\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Relevant experiences for the position:*')
        .replace(/- \*\*Matching qualifications \(education and certifications\):\*\*/, '\n\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Matching qualifications:*')
        .replace(/- \*\*Other relevant keywords:\*\*/, '\n\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Other relevant keywords:*')
        .replace(/- Soft skills: (\d+)/, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Soft skills:* $1\n\n')
        .replace(/- Hard skills: (\d+)/, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Hard skills:* $1\n\n')
        .replace(/- Experience: (\d+)/, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Experience:* $1\n\n')
        .replace(/- Education and certifications: (\d+)/, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Education and certifications:* $1\n\n')
        .replace(/- Keywords: (\d+)/, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*- Keywords:* $1\n\n')
        .replace(/^- /gm, '')
        .trim();

    if (jsonMatch) {
        markdown = markdown.replace(jsonRegex, '');
        markdown += `\n\n### 📦 Scoring JSON\n\`\`\`json\n${jsonMatch[1]}\n\`\`\``;
    }

    return markdown;
}

export function formatSuggestMarkdown(suggestions) {
    return suggestions
        .replace(/^A\.\s*Rephrasing suggestions:/m, '**Rephrasing Suggestions:**')
        .replace(/^B\.\s*Adding keywords and skills:/m, '**Adding Keywords and Skills:**')
        .replace(/^C\.\s*Adding missing experiences:/m, '**Adding Missing Experiences:**')
        .replace(/^- /gm, '\n\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- ')
        .replace(/\\n/g, '\n')
        .trim();
};

export function formatOptimizerMarkdown(optimizer) {
    if (!optimizer || typeof optimizer !== 'string') return '';

    const markdown = optimizer
        .replace(/\n/g, '\n\n')
        .replace(/\n{2,}/g, '\n\n')
        .replace(/^\*\*([^*]+):\*(.+)$/gm, (_, title, value) => `**${title.trim()}:**${value.trim()}`)
        .replace(/\n\* /g, '\n\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
        .replace(/^(?!### )(Available upon request\.)/gm, '> $1')
        .replace(/This updated resume[\s\S]*$/, '');
    return markdown.trim();
}

