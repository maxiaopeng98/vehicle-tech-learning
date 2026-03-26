// BEV深度学习页面交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 1. 学习进度跟踪
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const sections = document.querySelectorAll('.learning-section');
    
    function updateProgress() {
        let viewedSections = 0;
        const scrollPosition = window.scrollY + window.innerHeight * 0.3;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop) {
                viewedSections++;
            }
        });
        
        const progress = Math.round((viewedSections / sections.length) * 100);
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        
        // 保存进度到localStorage
        localStorage.setItem('bevLearningProgress', progress);
    }
    
    // 2. 侧边栏导航激活
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    window.addEventListener('scroll', function() {
        updateProgress();
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // 3. 学习笔记功能
    const notesText = document.getElementById('notesText');
    const saveNotesBtn = document.getElementById('saveNotes');
    const notesStatus = document.getElementById('notesStatus');
    
    // 加载保存的笔记
    const savedNotes = localStorage.getItem('bevLearningNotes');
    if (savedNotes) {
        notesText.value = savedNotes;
        notesStatus.textContent = '已加载上次保存的笔记';
        notesStatus.style.color = '#10b981';
    }
    
    // 保存笔记
    saveNotesBtn.addEventListener('click', function() {
        const notes = notesText.value;
        localStorage.setItem('bevLearningNotes', notes);
        notesStatus.textContent = '笔记已保存 ' + new Date().toLocaleTimeString();
        notesStatus.style.color = '#10b981';
        
        // 显示保存成功提示
        saveNotesBtn.textContent = '✓ 已保存';
        saveNotesBtn.style.background = '#10b981';
        setTimeout(() => {
            saveNotesBtn.textContent = '保存笔记';
            saveNotesBtn.style.background = '';
        }, 2000);
    });
    
    // 自动保存（每30秒）
    setInterval(() => {
        if (notesText.value !== localStorage.getItem('bevLearningNotes')) {
            localStorage.setItem('bevLearningNotes', notesText.value);
            notesStatus.textContent = '自动保存 ' + new Date().toLocaleTimeString();
            notesStatus.style.color = '#f59e0b';
        }
    }, 30000);
    
    // 4. 交互式测试功能
    function setupQuiz(quizId, submitBtnId, feedbackId) {
        const quizOptions = document.querySelectorAll(`#${quizId} .quiz-option`);
        const submitBtn = document.getElementById(submitBtnId);
        const feedback = document.getElementById(feedbackId);
        
        let selectedOptions = [];
        
        // 选项点击事件
        quizOptions.forEach(option => {
            option.addEventListener('click', function() {
                // 如果是单选题，清除其他选项的选择
                if (!this.closest('.quiz-options').classList.contains('multi-select')) {
                    quizOptions.forEach(opt => opt.classList.remove('selected'));
                }
                
                this.classList.toggle('selected');
                
                // 更新已选选项
                selectedOptions = [];
                quizOptions.forEach(opt => {
                    if (opt.classList.contains('selected')) {
                        selectedOptions.push(opt);
                    }
                });
            });
        });
        
        // 提交答案
        submitBtn.addEventListener('click', function() {
            if (selectedOptions.length === 0) {
                feedback.textContent = '请先选择答案！';
                feedback.className = 'quiz-feedback incorrect';
                feedback.style.display = 'block';
                return;
            }
            
            let allCorrect = true;
            let correctCount = 0;
            let totalCorrect = 0;
            
            // 计算正确答案数量
            quizOptions.forEach(opt => {
                if (opt.dataset.correct === 'true') {
                    totalCorrect++;
                }
            });
            
            // 检查每个选项
            quizOptions.forEach(option => {
                const isCorrect = option.dataset.correct === 'true';
                const isSelected = option.classList.contains('selected');
                
                if (isSelected && isCorrect) {
                    option.classList.add('correct');
                    option.classList.remove('incorrect');
                    correctCount++;
                } else if (isSelected && !isCorrect) {
                    option.classList.add('incorrect');
                    option.classList.remove('correct');
                    allCorrect = false;
                } else if (!isSelected && isCorrect) {
                    option.classList.add('correct');
                    option.classList.remove('incorrect');
                    allCorrect = false;
                } else {
                    option.classList.remove('correct', 'incorrect');
                }
            });
            
            // 显示反馈
            if (allCorrect && selectedOptions.length === totalCorrect) {
                feedback.textContent = `🎉 完全正确！你答对了 ${correctCount}/${totalCorrect} 题`;
                feedback.className = 'quiz-feedback correct';
            } else {
                feedback.textContent = `📝 答对了 ${correctCount}/${totalCorrect} 题，继续努力！`;
                feedback.className = 'quiz-feedback incorrect';
            }
            
            feedback.style.display = 'block';
            
            // 保存测试结果
            const quizResults = JSON.parse(localStorage.getItem('bevQuizResults') || '{}');
            quizResults[quizId] = {
                score: correctCount,
                total: totalCorrect,
                date: new Date().toISOString()
            };
            localStorage.setItem('bevQuizResults', JSON.stringify(quizResults));
        });
    }
    
    // 设置所有测试
    setupQuiz('quiz1', 'submitQuiz1', 'quizFeedback1');
    setupQuiz('quiz2', 'submitQuiz2', 'quizFeedback2');
    setupQuiz('quiz3', 'submitQuiz3', 'quizFeedback3');
    
    // 5. 工具栏功能
    const printBtn = document.getElementById('printBtn');
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    const highlightBtn = document.getElementById('highlightBtn');
    
    // 打印功能
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    // 书签功能
    bookmarkBtn.addEventListener('click', function() {
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        
        if (window.sidebar && window.sidebar.addPanel) {
            // Firefox
            window.sidebar.addPanel(pageTitle, pageUrl, '');
        } else if (window.external && ('AddFavorite' in window.external)) {
            // IE
            window.external.AddFavorite(pageUrl, pageTitle);
        } else if (window.opera && window.print) {
            // Opera
            this.title = pageTitle;
            this.href = pageUrl;
        } else {
            // 其他浏览器
            alert('请使用 Ctrl+D (Windows/Linux) 或 Cmd+D (Mac) 添加书签');
        }
    });
    
    // 高亮功能
    highlightBtn.addEventListener('click', function() {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.backgroundColor = 'rgba(245, 158, 11, 0.3)';
            span.style.padding = '2px 4px';
            span.style.borderRadius = '3px';
            range.surroundContents(span);
            
            // 保存高亮
            const highlights = JSON.parse(localStorage.getItem('bevHighlights') || '[]');
            highlights.push({
                text: selection.toString(),
                timestamp: new Date().toISOString(),
                section: getCurrentSection()
            });
            localStorage.setItem('bevHighlights', JSON.stringify(highlights));
            
            // 显示提示
            const tooltip = document.createElement('div');
            tooltip.textContent = '已高亮标记';
            tooltip.style.position = 'fixed';
            tooltip.style.bottom = '20px';
            tooltip.style.right = '20px';
            tooltip.style.background = '#f59e0b';
            tooltip.style.color = 'white';
            tooltip.style.padding = '10px 15px';
            tooltip.style.borderRadius = '8px';
            tooltip.style.zIndex = '1000';
            document.body.appendChild(tooltip);
            
            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 2000);
        } else {
            alert('请先选择要标记的文本');
        }
    });
    
    // 获取当前章节
    function getCurrentSection() {
        let currentSection = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) {
                currentSection = section.querySelector('.section-title').textContent;
            }
        });
        return currentSection;
    }
    
    // 6. 平滑滚动
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 7. 学习时间跟踪
    let startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((Date.now() - startTime) / 60000); // 分钟
        
        // 保存学习记录
        const learningRecords = JSON.parse(localStorage.getItem('bevLearningRecords') || '[]');
        learningRecords.push({
            date: new Date().toISOString(),
            duration: timeSpent,
            progress: localStorage.getItem('bevLearningProgress') || '0',
            notesLength: notesText.value.length
        });
        localStorage.setItem('bevLearningRecords', JSON.stringify(learningRecords));
        
        console.log(`本次BEV学习时长: ${timeSpent}分钟`);
    });
    
    // 8. 初始化进度
    updateProgress();
    
    // 9. 概念解释框交互
    const conceptBoxes = document.querySelectorAll('.concept-box');
    conceptBoxes.forEach(box => {
        box.addEventListener('click', function() {
            this.style.transform = this.style.transform === 'scale(0.98)' ? 'scale(1)' : 'scale(0.98)';
        });
    });
    
    // 10. 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // Ctrl+S 保存笔记
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNotesBtn.click();
        }
        
        // 空格键滚动
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            window.scrollBy(0, window.innerHeight * 0.8);
        }
    });
    
    // 11. 显示学习统计
    function showLearningStats() {
        const records = JSON.parse(localStorage.getItem('bevLearningRecords') || '[]');
        if (records.length > 0) {
            const totalTime = records.reduce((sum, record) => sum + record.duration, 0);
            const avgProgress = records.reduce((sum, record) => sum + parseInt(record.progress), 0) / records.length;
            
            console.log(`BEV学习统计：
            • 总学习次数: ${records.length} 次
            • 总学习时长: ${totalTime} 分钟
            • 平均进度: ${Math.round(avgProgress)}%
            • 最近学习: ${new Date(records[records.length-1].date).toLocaleDateString()}`);
        }
    }
    
    // 页面加载完成后显示统计
    setTimeout(showLearningStats, 1000);
    
    // 12. 响应式调整
    function adjustForMobile() {
        if (window.innerWidth < 768) {
            // 移动端优化
            document.querySelectorAll('.tech-table').forEach(table => {
                table.style.fontSize = '0.8rem';
            });
        }
    }
    
    window.addEventListener('resize', adjustForMobile);
    adjustForMobile();
});

// 3D模型加载函数（占位）
function load3DModel(modelType) {
    alert(`3D模型功能开发中...\n将展示: ${modelType}`);
    // 未来可以集成Three.js或Babylon.js
}

// 知识图谱功能（占位）
function showKnowledgeGraph() {
    alert('知识图谱功能开发中...\n将展示BEV技术知识网络');
    // 未来可以集成D3.js或ECharts
}

// 导出学习数据
function exportLearningData() {
    const data = {
        notes: localStorage.getItem('bevLearningNotes'),
        progress: localStorage.getItem('bevLearningProgress'),
        quizResults: JSON.parse(localStorage.getItem('bevQuizResults') || '{}'),
        highlights: JSON.parse(localStorage.getItem('bevHighlights') || '[]'),
        learningRecords: JSON.parse(localStorage.getItem('bevLearningRecords') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `BEV学习数据_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('学习数据已导出为JSON文件');
}