export function generateCSV(data, columns) {
  try {
    if (!data || data.length === 0) {
      return 'No data available';
    }

    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(item => {
      return columns.map(col => {
        const value = item[col.key] || '';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new Error('Failed to generate CSV');
  }
}

export function downloadCSV(csvContent, filename) {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw new Error('Failed to download CSV');
  }
}

export function exportRequirementsToCSV(requirements) {
  const columns = [
    { key: 'requirement_id', header: 'Requirement ID' },
    { key: 'requirement_type', header: 'Type' },
    { key: 'user_story', header: 'User Story' },
    { key: 'priority', header: 'Priority' },
    { key: 'complexity', header: 'Complexity' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created At' }
  ];

  const csv = generateCSV(requirements, columns);
  const filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

export function exportRoadmapToCSV(roadmapItems) {
  const columns = [
    { key: 'roadmap_id', header: 'Roadmap ID' },
    { key: 'roadmap_name', header: 'Name' },
    { key: 'timeframe', header: 'Timeframe' },
    { key: 'strategic_theme', header: 'Theme' },
    { key: 'status', header: 'Status' },
    { key: 'stakeholder_visibility', header: 'Visibility' },
    { key: 'created_at', header: 'Created At' }
  ];

  const csv = generateCSV(roadmapItems, columns);
  const filename = `roadmap_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

export function exportIdeasToCSV(ideas) {
  const columns = [
    { key: 'idea_id', header: 'Idea ID' },
    { key: 'idea_name', header: 'Name' },
    { key: 'triage_status', header: 'Status' },
    { key: 'estimated_impact', header: 'Impact' },
    { key: 'feasibility', header: 'Feasibility' },
    { key: 'submission_date', header: 'Submitted' }
  ];

  const csv = generateCSV(ideas, columns);
  const filename = `ideas_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

export function generateRoadmapPDF(roadmap) {
  const content = `
    Roadmap: ${roadmap.roadmap_name}
    ID: ${roadmap.roadmap_id}
    Timeframe: ${roadmap.timeframe}
    Strategic Theme: ${roadmap.strategic_theme}
    Status: ${roadmap.status}
    
    Risk Assessment:
    ${roadmap.risk_assessment || 'None provided'}
    
    Success Metrics:
    ${JSON.stringify(roadmap.success_metrics, null, 2)}
    
    Dependencies:
    ${roadmap.dependencies?.join(', ') || 'None'}
  `;

  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `roadmap_${roadmap.roadmap_id}.txt`;
  link.click();
}