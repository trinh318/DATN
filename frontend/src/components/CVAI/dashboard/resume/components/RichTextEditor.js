import { Button } from '@/components/control/ui/button';
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext';
import { Brain, LoaderCircle } from 'lucide-react';
import React, { useContext, useState } from 'react'
import { BtnBold, BtnBulletList, BtnItalic, BtnLink, BtnNumberedList, BtnStrikeThrough, BtnStyles, BtnUnderline, Editor, EditorProvider, HtmlButton, Separator, Toolbar } from 'react-simple-wysiwyg'
import { AIChatSession } from '@/service/AIModal';
import { toast } from 'sonner';

const PROMPT = 'position titile: {positionTitle} , Depends on position title give me 5-7 bullet points for my experience in resume (Please do not add experince level and No JSON array) , give me result in HTML tags'

function RichTextEditor({ onRichTextEditorChange, index, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
  const [loading, setLoading] = useState(false);

  const GenerateSummeryFromAI = async () => {
    if (!resumeInfo?.workExperience[index]?.position) {
      toast('Please Add Position Title');
      return;
    }

    setLoading(true);
    const prompt = PROMPT.replace('{positionTitle}', resumeInfo.workExperience[index].position);

    try {
      const result = await AIChatSession.sendMessage(prompt);
      const rawText = await result.response.text();

      const parsed = JSON.parse(rawText);
      const points = parsed.bulletPoints;

      if (!Array.isArray(points)) throw new Error('Invalid bulletPoints format');

      const htmlList = `<ul>${points.map(item => `<li>${item}</li>`).join('')}</ul>`;

      setValue(htmlList);
      onRichTextEditorChange({ target: { value: htmlList } });

    } catch (err) {
      console.error(err);
      toast.error('Invalid response format. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div>
      <div className='flex justify-between my-2'>
        <label className='text-xs'>Description</label>
        <Button variant="outline" size="sm" onClick={GenerateSummeryFromAI} disabled={loading} className="flex gap-2 border-primary text-primary">
          {loading ?
            <LoaderCircle className='animate-spin' /> :
            <>
              <Brain className='h-4 w-4' /> Generate from AI
            </>
          }
        </Button>
      </div>
      <EditorProvider>
        <Editor value={value} onChange={(e) => { setValue(e.target.value); onRichTextEditorChange(e); }}>
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  )
}

export default RichTextEditor