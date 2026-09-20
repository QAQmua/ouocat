import React, { useState, useEffect } from 'react';
import { AiConfig } from '../types';

interface ApiSettingsScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  config: AiConfig;
  onSave: (newConfig: AiConfig) => void;
}

const ApiSettingsScreen: React.FC<ApiSettingsScreenProps> = ({ onBack, isDarkMode, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AiConfig>({ ...config });
  const [hasChanges, setHasChanges] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'pulling'>('idle');
  const [pulledModels, setPulledModels] = useState<string[]>(config.availableModels || []);
  const [showPicker, setShowPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const isDifferent = JSON.stringify(localConfig) !== JSON.stringify(config);
    setHasChanges(isDifferent);
  }, [localConfig, config]);

  const handleSave = () => {
    setStatus('saving');
    onSave({
      ...localConfig,
      availableModels: pulledModels
    });
    setTimeout(() => {
      setStatus('saved');
      setHasChanges(false);
      setTimeout(() => setStatus('idle'), 2000);
    }, 600);
  };

  const handlePullModels = async () => {
    const apiKey = localConfig.apiKey.trim() || process.env.API_KEY;
    
    if (!apiKey) {
      setErrorMessage('未提供密钥 (Key)，请先填写');
      return;
    }

    let baseUrl = localConfig.baseUrl.trim().replace(/\/$/, '');
    if (!baseUrl.startsWith('http')) {
      setErrorMessage('无效的 URL，请检查端点');
      return;
    }

    setStatus('pulling');
    setErrorMessage('');
    
    const baseWithoutPath = baseUrl.replace(/\/v1(beta)?$/, '');
    const testPaths = [
      `${baseUrl}/v1beta/models`,
      `${baseUrl}/v1/models`,
      `${baseUrl}/models`,
      `${baseWithoutPath}/v1beta/models`,
      `${baseWithoutPath}/v1/models`
    ];
    
    const uniquePaths = Array.from(new Set(testPaths));
    let successData = null;
    let lastErrorDetail = '';

    for (const path of uniquePaths) {
      try {
        const url = `${path}?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors'
        });

        if (response.ok) {
          const data = await response.json();
          if (data && (data.models || (Array.isArray(data) && data.length > 0))) {
            successData = data;
            break;
          }
        } else {
          const errorBody = await response.json().catch(() => ({}));
          lastErrorDetail = errorBody.error?.message || `状态码: ${response.status}`;
        }
      } catch (e) {
        lastErrorDetail = e instanceof Error ? e.message : '连接超时';
      }
    }

    if (successData) {
      let models: string[] = [];
      if (Array.isArray(successData.models)) {
        models = successData.models.map((m: any) => m.name.replace('models/', ''));
      } else if (Array.isArray(successData)) {
        models = successData.map((m: any) => (m.name || m.id || m).replace('models/', ''));
      }
      
      if (models.length > 0) {
        setPulledModels(models);
        setShowPicker(true);
      } else {
        setErrorMessage('未发现有效模型 ID');
      }
    } else {
      setErrorMessage(lastErrorDetail || '拉取模型列表失败');
    }
    
    setStatus('idle');
  };

  const selectModel = (name: string) => {
    setLocalConfig({ ...localConfig, modelName: name });
    setShowPicker(false);
  };

  const bgColor = isDarkMode ? 'bg-black' : 'bg-[#F2F2F7]';
  const itemBg = isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const subTextColor = isDarkMode ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
  const borderColor = isDarkMode ? 'border-[#38383A]' : 'border-[#C6C6C8]';
  const iconColor = isDarkMode ? 'text-white/60' : 'text-black/60';

  return (
    <div className={`w-full h-full ${bgColor} flex flex-col transition-colors duration-300 relative`}>
      {/* iOS Header */}
      <div className={`pt-12 pb-2 px-4 flex items-center justify-between sticky top-0 z-20 ${isDarkMode ? 'bg-black/80' : 'bg-[#F2F2F7]/80'} backdrop-blur-xl`}>
        <button onClick={onBack} className="flex items-center space-x-0.5 text-[#007AFF] active:opacity-50 transition-opacity -ml-1 py-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[15px] font-normal">设置</span>
        </button>
        <h1 className={`text-base font-semibold ${textColor}`}>API 与模型</h1>
        <button onClick={handleSave} disabled={!hasChanges || status === 'saving'} className={`text-[15px] font-semibold transition-all ${hasChanges ? 'text-[#007AFF] active:opacity-50' : 'text-[#8E8E93]'}`}>
          {status === 'saving' ? '正在保存' : '完成'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-20">
        {(status === 'saved' || errorMessage) && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 ${errorMessage ? 'bg-red-500/95' : 'bg-gray-800/90'} text-white px-5 py-2.5 rounded-2xl text-[12px] font-medium z-50 animate-in fade-in slide-in-from-top-2 shadow-2xl max-w-[85%] text-center border border-white/10`}>
            {errorMessage || '配置已成功更新'}
          </div>
        )}

        {/* Server Section */}
        <div className="space-y-2">
          <h2 className={`px-4 text-[13px] uppercase ${subTextColor}`}>核心服务配置</h2>
          <div className={`${itemBg} rounded-xl overflow-hidden shadow-sm`}>
            {/* Endpoint */}
            <div className={`px-4 py-3 flex flex-col border-b ${borderColor}`}>
              <span className={`text-[12px] font-medium mb-1 ${subTextColor}`}>API 端点 (Base URL)</span>
              <input type="text" value={localConfig.baseUrl} onChange={(e) => setLocalConfig({...localConfig, baseUrl: e.target.value})} className={`bg-transparent outline-none text-base ${textColor}`} placeholder="https://..." />
            </div>

            {/* Key */}
            <div className={`px-4 py-3 flex flex-col border-b ${borderColor} relative`}>
              <span className={`text-[12px] font-medium mb-1 ${subTextColor}`}>API 密钥 (API Key)</span>
              <div className="flex items-center">
                <input type={showKey ? "text" : "password"} value={localConfig.apiKey} onChange={(e) => setLocalConfig({...localConfig, apiKey: e.target.value})} className={`bg-transparent outline-none text-base flex-1 ${textColor}`} placeholder="密钥仅用于拉取和本地调用" />
                <button onClick={() => setShowKey(!showKey)} className="ml-2 text-[12px] font-bold text-[#007AFF] active:opacity-40 p-1">{showKey ? "隐藏" : "查看"}</button>
              </div>
            </div>

            {/* Model Selection Button (The New requested feature) */}
            <div className={`px-4 py-3 flex items-center justify-between border-b ${borderColor} active:bg-blue-500/5 transition-colors cursor-pointer`} onClick={() => setShowPicker(true)}>
              <div className="flex flex-col">
                <span className={`text-[12px] font-medium mb-0.5 ${subTextColor}`}>当前模型</span>
                <span className={`text-base font-bold ${textColor}`}>{localConfig.modelName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[12px] text-[#007AFF] font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">选择拉取模型</span>
                <svg className={`w-4 h-4 ${subTextColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Pull Action */}
            <div className={`px-4 py-3 flex items-center justify-between bg-inherit`}>
               <span className={`text-[12px] font-medium ${subTextColor}`}>刷新可用模型列表</span>
               <button 
                onClick={handlePullModels} 
                disabled={status === 'pulling'} 
                className={`text-[13px] font-bold text-[#007AFF] active:opacity-50 disabled:opacity-30 flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-blue-500/20`}
              >
                {status === 'pulling' ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-[#007AFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>正在拉取...</span>
                  </>
                ) : (
                  <span>开始拉取</span>
                )}
              </button>
            </div>
          </div>
          <p className={`px-4 text-[11px] leading-relaxed ${subTextColor}`}>
            通过拉取操作获取的模型将自动保存在列表，以便随时切换。
          </p>
        </div>

        {/* Param Section */}
        <div className="space-y-2">
          <h2 className={`px-4 text-[13px] uppercase ${subTextColor}`}>推理性能</h2>
          <div className={`${itemBg} rounded-xl overflow-hidden px-4 py-4 space-y-4 shadow-sm`}>
            <div className="flex justify-between items-center">
              <span className={`text-base ${textColor}`}>创造力 (Temperature)</span>
              <span className="font-mono text-[#007AFF] font-bold bg-blue-500/10 px-2 py-0.5 rounded-md">{localConfig.temperature.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={localConfig.temperature} onChange={(e) => setLocalConfig({...localConfig, temperature: parseFloat(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#007AFF]" />
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <button onClick={() => setLocalConfig({...config})} disabled={!hasChanges} className={`text-sm font-bold transition-opacity ${hasChanges ? 'text-red-500' : 'text-gray-400 opacity-0'}`}>重置修改</button>
        </div>
      </div>

      {/* Model Selection Modal (With new Silky Transitions) */}
      {showPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-ios-fade" onClick={() => setShowPicker(false)}></div>
          <div className={`relative w-full max-h-[70%] flex flex-col ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'} rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'border-white/10' : 'border-black/5'} animate-ios-pop`}>
            <div className={`px-6 py-5 border-b ${borderColor} flex justify-between items-center bg-inherit sticky top-0 z-10`}>
              <div className="flex flex-col">
                <h3 className={`text-xl font-bold ${textColor}`}>选择拉取的模型</h3>
                <span className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 ${subTextColor}`}>从当前节点拉取的可用列表</span>
              </div>
              <button onClick={() => setShowPicker(false)} className="p-2 rounded-full active:bg-gray-500/10 transition-colors">
                 <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
              {pulledModels.length > 0 ? pulledModels.map((model) => (
                <button 
                  key={model} 
                  onClick={() => selectModel(model)} 
                  className={`w-full px-6 py-5 text-left text-base font-bold flex justify-between items-center active:bg-blue-500/10 transition-colors border-b last:border-0 ${borderColor} ${localConfig.modelName === model ? 'bg-blue-500/5' : ''}`}
                >
                  <span className={`truncate ${localConfig.modelName === model ? 'text-[#007AFF]' : textColor}`}>{model}</span>
                  {localConfig.modelName === model && (
                    <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )) : (
                <div className="py-20 flex flex-col items-center justify-center space-y-4 px-10 text-center">
                  <div className={`p-5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                     <svg className={`w-10 h-10 ${subTextColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <p className={`text-sm font-medium ${subTextColor}`}>
                    列表为空，请先点击<br/><strong className="text-[#007AFF]">拉取模型</strong>
                  </p>
                </div>
              )}
            </div>
            <div className={`p-6 border-t ${borderColor} bg-inherit text-center`}>
               <p className={`text-[9px] font-bold tracking-[0.2em] ${subTextColor}`}>IOS 26 NEURAL SELECTOR</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiSettingsScreen;