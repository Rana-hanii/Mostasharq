import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdownFormat',
  standalone: true
})
export class MarkdownFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(message: string): SafeHtml {
    if (!message) return '';
    let formattedMessage = message;

    // العناوين
    formattedMessage = formattedMessage.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    formattedMessage = formattedMessage.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    formattedMessage = formattedMessage.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // bold
    formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // italic
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // strikethrough
    formattedMessage = formattedMessage.replace(/--(.*?)--/g, '<s>$1</s>');

    // القوائم المرقمة (ol/li)
    formattedMessage = formattedMessage.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');
    formattedMessage = formattedMessage.replace(/(<li>.*?<\/li>)/gims, '<ol>$1</ol>');

    // القوائم النقطية (ul/li)
    formattedMessage = formattedMessage.replace(/^\s*-\s+(.*)$/gim, '<li>$1</li>');
    formattedMessage = formattedMessage.replace(/(<li>.*?<\/li>)/gims, '<ul>$1</ul>');

    // New lines
    formattedMessage = formattedMessage.replace(/\n/g, '<br>');
    // Tabs
    formattedMessage = formattedMessage.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    // Escaped quotes
    formattedMessage = formattedMessage.replace(/\\"/g, '"');

    return this.sanitizer.bypassSecurityTrustHtml(formattedMessage);
  }
} 