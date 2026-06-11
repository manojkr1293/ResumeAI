export interface ResumePreviewData {
  title: string;
  template: 'professional' | 'modern' | 'minimal';
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  skills: Array<{ id: string; name: string; level: string }>;
  projects: Array<{ id: string; name: string; description: string; technologies: string; link: string }>;
  certifications: Array<{ id: string; name: string; issuer: string; date: string; credentialId: string }>;
  languages: Array<{ id: string; name: string; proficiency: string }>;
}

export function ResumePreview({ data }: { data: ResumePreviewData }) {
  const theme = {
    minimal: {
      shell: 'bg-white rounded-lg shadow p-8 max-w-4xl mx-auto border border-slate-100',
      header: 'text-center border-b border-slate-200 pb-6 mb-6',
      name: 'text-3xl font-bold text-slate-950',
      heading: 'text-sm font-bold uppercase tracking-wide text-slate-950 border-b border-slate-200 pb-1 mb-3',
      chip: 'rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700',
    },
    modern: {
      shell: 'bg-white rounded-lg shadow p-8 max-w-4xl mx-auto border-t-8 border-cyan-600',
      header: 'text-left border-b border-cyan-100 pb-6 mb-6',
      name: 'text-4xl font-extrabold text-slate-950',
      heading: 'text-sm font-bold uppercase tracking-wide text-cyan-700 mb-3',
      chip: 'rounded-md bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800',
    },
    professional: {
      shell: 'bg-white rounded-lg shadow p-8 max-w-4xl mx-auto border border-slate-300',
      header: 'text-left bg-slate-900 px-6 py-5 text-white -m-8 mb-6 rounded-t-lg',
      name: 'text-3xl font-bold text-white',
      heading: 'text-base font-bold text-slate-950 border-l-4 border-slate-900 pl-3 mb-3',
      chip: 'rounded-sm bg-slate-900 px-3 py-1 text-sm text-white',
    },
  }[data.template];

  const contactTextClass = data.template === 'professional' ? 'text-slate-200' : 'text-slate-600';
  const linkClass = data.template === 'professional' ? 'text-cyan-200' : 'text-blue-600';
  const sectionTitle = (label: string) => <h2 className={theme.heading}>{label}</h2>;

  return (
    <div className={theme.shell}>
      <div className={theme.header}>
        <h1 className={theme.name}>
          {`${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim() || data.title || 'Your Name'}
        </h1>
        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm ${contactTextClass}`}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin} className={linkClass}>LinkedIn</a>}
          {data.personalInfo.github && <a href={data.personalInfo.github} className={linkClass}>GitHub</a>}
          {data.personalInfo.website && <a href={data.personalInfo.website} className={linkClass}>Website</a>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-6">
          {sectionTitle('Professional Summary')}
          <p className="text-gray-700">{data.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Experience')}
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between gap-4">
                <h3 className="font-medium text-gray-900">{exp.position}</h3>
                <span className="shrink-0 text-sm text-gray-600">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <p className="text-gray-700">{exp.company}</p>
              {exp.description && <p className="mt-1 text-gray-600">{exp.description}</p>}
              {exp.bullets.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={`${exp.id}-${idx}`}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Education')}
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between gap-4">
                <h3 className="font-medium text-gray-900">{edu.degree} in {edu.field}</h3>
                <span className="shrink-0 text-sm text-gray-600">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <p className="text-gray-700">{edu.institution}</p>
              {edu.gpa && <p className="text-sm text-gray-600">GPA / CGPA / Percentage: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Skills')}
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill.id} className={theme.chip}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.projects.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Projects')}
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4">
              <h3 className="font-medium text-gray-900">{project.name}</h3>
              {project.technologies && <p className="text-sm text-gray-600">{project.technologies}</p>}
              <p className="mt-1 text-gray-700">{project.description}</p>
              {project.link && <a href={project.link} className="text-sm text-blue-600">View Project</a>}
            </div>
          ))}
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Certifications')}
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <span className="text-gray-900">{cert.name}</span>
              <span className="text-gray-600"> - {cert.issuer}</span>
              <span className="text-sm text-gray-600"> ({cert.date})</span>
            </div>
          ))}
        </div>
      )}

      {data.languages.length > 0 && (
        <div className="mb-6">
          {sectionTitle('Languages')}
          <div className="flex flex-wrap gap-2">
            {data.languages.map((lang) => (
              <span key={lang.id} className={theme.chip}>
                {lang.name} ({lang.proficiency})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
