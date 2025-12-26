import React, { useState, useEffect } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
  badge?: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, icon, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-gradient-to-l from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 flex items-center justify-between text-right"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="font-semibold text-gray-800">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <span className={`transform transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-5 py-5 bg-white border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

interface Field {
  title: string;
  kind: string;
  value: any;
}

interface Section {
  id: string;
  title: string;
  content: any;
}

interface Page {
  id: string;
  title: string;
  sections: Section[];
}

interface FormData {
  pages: Page[];
}

interface MainContentProps {
  websiteData?: any;
}

const getPageIcon = (id: string): string => {
  const icons: { [key: string]: string } = {
    global: '⚙️',
    home: '🏠',
    about: '👤',
    services: '🛠️',
    portfolio: '🎨',
    events: '📅',
    collaboration: '🤝',
    contact: '📞',
  };
  return icons[id] || '📄';
};

const getSectionIcon = (id: string): string => {
  const icons: { [key: string]: string } = {
    meta: '🔖',
    navigation: '🧭',
    accessibility: '♿',
    footer: '📋',
    hero: '🎯',
    introduction: '📝',
    approach: '🎓',
    services: '💼',
    team: '👥',
    workshops: '🎪',
    social: '📱',
    whyUs: '❓',
    cta: '🚀',
    trust: '🤝',
    header: '📰',
    mission: '🎯',
    vision: '👁️',
    values: '💎',
    form: '📝',
    directContact: '☎️',
  };
  return icons[id] || '📌';
};

const MainContent: React.FC<MainContentProps> = ({ websiteData }) => {
  const [data, setData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  useEffect(() => {
    if (websiteData) {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://vix-admin.siramirmoghi3.workers.dev'}/my-content`, {
        credentials: 'include',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch content');
          }
          return response.json();
        })
        .then(json => {
          setData(json);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching content:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [websiteData]);

  const updateValue = (path: (string | number)[], newValue: any) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = newValue;
      return newData;
    });
  };

  const addArrayItem = (path: (string | number)[]) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      let current: any = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      if (Array.isArray(current)) {
        const defaultItem = current.length > 0 ? JSON.parse(JSON.stringify(current[0])) : {};
        const resetValues = (obj: any) => {
          Object.keys(obj).forEach(key => {
            if (obj[key] && typeof obj[key] === 'object' && obj[key].kind) {
              obj[key].value = obj[key].kind === 'boolean' ? false : '';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              resetValues(obj[key]);
            }
          });
        };
        resetValues(defaultItem);
        current.push(defaultItem);
      }
      return newData;
    });
  };

  const removeArrayItem = (path: (string | number)[], index: number) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      let current: any = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      if (Array.isArray(current)) {
        current.splice(index, 1);
      }
      return newData;
    });
  };

  const handleSave = async () => {
    if (!data || saving) return;

    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://vix-admin.siramirmoghi3.workers.dev'}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      await response.json();
      alert('محتوا با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('خطا در ذخیره محتوا. لطفاً دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: Field, path: (string | number)[]): JSX.Element => {
    const handleChange = (value: any) => {
      updateValue([...path, 'value'], value);
    };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, path: (string | number)[]) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show loading state
      updateValue([...path, 'value'], 'در حال آپلود...');

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://vix-admin.siramirmoghi3.workers.dev'}/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        if (result.success) {
          updateValue([...path, 'value'], result.url);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.');
        updateValue([...path, 'value'], '');
      }
    }
  };

    switch (field.kind) {
      case 'text':
        return (
          <div key={path.join('.')} className="mb-5 group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
              {field.title}
            </label>
            <div className="relative">
              <input
                type="text"
                value={field.value || ''}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
                placeholder={`${field.title} را وارد کنید...`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>
        );
      case 'number':
        return (
          <div key={path.join('.')} className="mb-5 group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
              {field.title}
            </label>
            <input
              type="number"
              value={field.value || ''}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
              dir="ltr"
            />
          </div>
        );
      case 'boolean':
        return (
          <div key={path.join('.')} className="mb-5">
            <label className="relative flex items-center gap-4 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => handleChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{field.title}</span>
            </label>
          </div>
        );
      case 'url':
        return (
          <div key={path.join('.')} className="mb-5 group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
              {field.title}
            </label>
            <div className="relative">
              <input
                type="url"
                value={field.value || ''}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
                dir="ltr"
                placeholder="https://..."
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={path.join('.')} className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.title}
            </label>
            <div className="space-y-3">
              {field.value && field.value !== 'در حال آپلود...' ? (
                <div className="relative group inline-block">
                  <img 
                    src={field.value} 
                    alt="Preview" 
                    className="w-40 h-40 object-cover rounded-2xl shadow-lg border-2 border-gray-100 group-hover:shadow-xl transition-all duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <button
                      onClick={() => updateValue([...path, 'value'], '')}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      حذف
                    </button>
                  </div>
                </div>
              ) : field.value === 'در حال آپلود...' ? (
                <div className="w-40 h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex flex-col items-center justify-center border-2 border-blue-200">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-3"></div>
                  <span className="text-blue-600 text-sm font-medium">در حال آپلود...</span>
                </div>
              ) : (
                <label className="w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, path)}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">آپلود تصویر</span>
                </label>
              )}
            </div>
          </div>
        );
      case 'texteditor':
        return (
          <div key={path.join('.')} className="mb-5 group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
              {field.title}
            </label>
            <textarea
              value={field.value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white resize-y min-h-[120px] hover:border-gray-300 leading-relaxed"
              rows={5}
              placeholder={`${field.title} را وارد کنید...`}
            />
          </div>
        );
      case 'array':
        return (
          <div key={path.join('.')} className="mb-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{field.title}</h3>
                  <span className="text-sm text-gray-500">{Array.isArray(field.value) ? field.value.length : 0} آیتم</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const arrayPath = [...path, 'value'];
                  addArrayItem(arrayPath);
                }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                افزودن
              </button>
            </div>
            <div className="space-y-3">
              {Array.isArray(field.value) && field.value.map((item, index) => {
                // Check if the item itself is a field (has 'kind' property)
                const isDirectField = item && typeof item === 'object' && 'kind' in item;
                
                // Get a title for the accordion from the item if possible
                let accordionTitle = `آیتم ${index + 1}`;
                if (item && typeof item === 'object') {
                  if (isDirectField) {
                    // For direct fields, use the item's value as title
                    accordionTitle = item.value ? `${item.value}` : `آیتم ${index + 1}`;
                  } else {
                    // Try to find a name, title, or label field
                    const titleField = item.name?.value || item.title?.value || item.label?.value || item.id?.value;
                    if (titleField) {
                      accordionTitle = `${titleField} (${index + 1})`;
                    }
                  }
                }
                
                return (
                  <AccordionItem
                    key={index}
                    title={accordionTitle}
                    defaultOpen={false}
                    icon="📄"
                    badge={`#${index + 1}`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeArrayItem([...path, 'value'], index)}
                          className="text-red-500 hover:text-white hover:bg-red-500 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-red-300 hover:border-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          حذف آیتم
                        </button>
                      </div>
                      {isDirectField ? (
                        // If item is a direct field, render it as a field
                        renderField(item as Field, [...path, 'value', index])
                      ) : (
                        // Otherwise, render it as an object with nested fields
                        renderObject(item, [...path, 'value', index])
                      )}
                    </div>
                  </AccordionItem>
                );
              })}
            </div>
          </div>
        );
      case 'object':
        return (
          <div key={path.join('.')} className="mb-5">
            <AccordionItem title={field.title} defaultOpen={false} icon="📦">
              <div className="space-y-4">
                {renderObject(field.value, [...path, 'value'])}
              </div>
            </AccordionItem>
          </div>
        );
      default:
        return (
          <div key={path.join('.')} className="mb-5 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-800 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            نوع فیلد ناشناخته: {field.kind}
          </div>
        );
    }
  };

  const renderObject = (obj: any, path: (string | number)[]): JSX.Element[] => {
    if (!obj || typeof obj !== 'object') return [];
    
    return Object.keys(obj).map(key => {
      const field = obj[key];
      if (field && typeof field === 'object' && 'kind' in field) {
        return renderField(field as Field, [...path, key]);
      } else if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
        const hasNestedFields = Object.values(field).some((val: any) =>
          val && typeof val === 'object' && ('kind' in val || Object.values(val).some((v: any) => v && typeof v === 'object' && 'kind' in v))
        );

        if (hasNestedFields) {
          return (
            <AccordionItem key={key} title={key} defaultOpen={false} icon="📁">
              <div className="space-y-4">
                {renderObject(field, [...path, key])}
              </div>
            </AccordionItem>
          );
        } else {
          return (
            <div key={key} className="mb-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center text-xs">📌</span>
                {key}
              </h4>
              <div className="pr-4 border-r-2 border-gray-200">
                {renderObject(field, [...path, key])}
              </div>
            </div>
          );
        }
      } else {
        console.log('Unknown field structure at', [...path, key], field);
        return (
          <div key={key} className="mb-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center gap-2">
            <span className="font-semibold text-gray-700">{key}:</span> 
            <span className="text-gray-600">{String(field)}</span>
          </div>
        );
      }
    });
  };

  if (loading) {
    return (
      <main className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">در حال بارگذاری</h3>
          <p className="text-gray-500">لطفاً صبر کنید...</p>
        </div>
      </main>
    );
  }

  if (!data || !data.pages || data.pages.length === 0) {
    return (
      <main className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">خطا در بارگذاری</h3>
          <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
        </div>
      </main>
    );
  }

  const currentPage = data.pages[activePageIndex];
  const currentSection = currentPage?.sections?.[activeSectionIndex];

  return (
    <main className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">مدیریت محتوا</h2>
                <p className="text-gray-500 text-sm">ویرایش محتوای صفحات و بخش‌های وب‌سایت</p>
              </div>
            </div>
            {/* Save Button */}
            <button
              type="button"
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>ذخیره تغییرات</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Pages */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 sticky top-6">
              <div className="p-4 bg-gradient-to-l from-gray-50 to-white border-b border-gray-100">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  صفحات
                </h3>
              </div>
              <div className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {data.pages.map((page, pageIndex) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      setActivePageIndex(pageIndex);
                      setActiveSectionIndex(0);
                    }}
                    className={`w-full text-right px-4 py-3 rounded-xl mb-1 transition-all duration-200 flex items-center gap-3 ${
                      activePageIndex === pageIndex
                        ? 'bg-gradient-to-l from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className={`text-xl ${activePageIndex === pageIndex ? 'opacity-100' : 'opacity-70'}`}>
                      {getPageIcon(page.id)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{page.title}</div>
                      <div className={`text-xs ${activePageIndex === pageIndex ? 'text-blue-100' : 'text-gray-400'}`}>
                        {page.sections?.length || 0} بخش
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Sections Tabs */}
            {currentPage?.sections && currentPage.sections.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPageIcon(currentPage.id)}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{currentPage.title}</h3>
                      <p className="text-xs text-gray-500">انتخاب بخش برای ویرایش</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 flex flex-wrap gap-2">
                  {currentPage.sections.map((section, sectionIndex) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionIndex(sectionIndex)}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                        activeSectionIndex === sectionIndex
                          ? 'bg-gradient-to-l from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{getSectionIcon(section.id)}</span>
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Content */}
            {currentSection && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-l from-indigo-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <span className="text-2xl">{getSectionIcon(currentSection.id)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{currentSection.title}</h3>
                      <p className="text-sm text-gray-500">شناسه: {currentSection.id}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {currentSection.content && renderObject(
                      currentSection.content, 
                      ['pages', activePageIndex, 'sections', activeSectionIndex, 'content']
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
