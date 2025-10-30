import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDataProps {
  items: any[];
  filename?: string;
}

export default function ExportData({ items, filename = 'terp-pm-export' }: ExportDataProps) {
  
  const exportToCSV = () => {
    if (!items || items.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['ID', 'Type', 'Title', 'Status', 'Priority', 'Description', 'Created', 'Updated'];
    const rows = items.map(item => [
      item.itemId,
      item.type,
      item.title,
      item.status,
      item.priority || '',
      (item.description || '').replace(/"/g, '""'),
      new Date(item.createdAt).toISOString(),
      new Date(item.updatedAt).toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    toast.success('Exported to CSV');
  };

  const exportToMarkdown = () => {
    if (!items || items.length === 0) {
      toast.error('No data to export');
      return;
    }

    const mdContent = [
      `# TERP Product Management Export`,
      ``,
      `Generated: ${new Date().toLocaleString()}`,
      `Total Items: ${items.length}`,
      ``,
      `---`,
      ``,
      ...items.map(item => [
        `## ${item.itemId}: ${item.title}`,
        ``,
        `- **Type**: ${item.type}`,
        `- **Status**: ${item.status}`,
        `- **Priority**: ${item.priority || 'Not set'}`,
        `- **Created**: ${new Date(item.createdAt).toLocaleDateString()}`,
        `- **Updated**: ${new Date(item.updatedAt).toLocaleDateString()}`,
        ``,
        item.description ? `### Description\n\n${item.description}\n` : '',
        `---`,
        ``
      ].join('\n'))
    ].join('\n');

    downloadFile(mdContent, `${filename}.md`, 'text/markdown');
    toast.success('Exported to Markdown');
  };

  const exportToJSON = () => {
    if (!items || items.length === 0) {
      toast.error('No data to export');
      return;
    }

    const jsonContent = JSON.stringify({
      exportDate: new Date().toISOString(),
      totalItems: items.length,
      items: items.map(item => ({
        id: item.itemId,
        type: item.type,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        tags: item.tags,
        related: item.related,
        metadata: item.metadata,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    }, null, 2);

    downloadFile(jsonContent, `${filename}.json`, 'application/json');
    toast.success('Exported to JSON');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <Table className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToMarkdown}>
          <FileText className="w-4 h-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
