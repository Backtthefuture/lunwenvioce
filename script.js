document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
                
                // 在移动设备上，点击导航链接后关闭侧边栏
                if (window.innerWidth <= 768) {
                    toggleSidebar(false);
                }
            }
        });
    });
    
    // 初始化侧边栏目录
    initSidebarToc();
    
    // 添加返回顶部按钮
    createBackToTopButton();
    
    // 添加阅读进度指示器
    createReadingProgressIndicator();
    
    // 添加图表可视化
    createCharts();
    
    // 初始化音频播放功能
    initAudioPlayers();
});

// 初始化侧边栏目录
function initSidebarToc() {
    // 获取DOM元素
    const sidebar = document.getElementById('sidebar-toc');
    const toggleBtn = document.getElementById('toc-toggle-btn');
    const closeBtn = document.querySelector('.toc-close');
    const overlay = document.getElementById('sidebar-overlay');
    const tocList = document.querySelector('.toc-list');
    
    // 生成目录内容
    generateTocContent(tocList);
    
    // 打开侧边栏
    toggleBtn.addEventListener('click', function() {
        toggleSidebar(true);
    });
    
    // 关闭侧边栏
    closeBtn.addEventListener('click', function() {
        toggleSidebar(false);
    });
    
    // 点击遮罩层关闭侧边栏
    overlay.addEventListener('click', function() {
        toggleSidebar(false);
    });
    
    // 监听滚动事件，高亮当前章节
    window.addEventListener('scroll', highlightCurrentSection);
    
    // 初始高亮当前章节
    setTimeout(highlightCurrentSection, 100);
}

// 切换侧边栏显示状态
function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar-toc');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (show) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    } else {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动
    }
}

// 生成目录内容
function generateTocContent(tocList) {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        const sectionId = section.id;
        const sectionTitle = section.querySelector('h2').textContent;
        
        const listItem = document.createElement('li');
        listItem.className = 'toc-item';
        
        const link = document.createElement('a');
        link.href = `#${sectionId}`;
        link.textContent = sectionTitle;
        link.setAttribute('data-section', sectionId);
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
        
        // 添加子目录项
        const subsections = section.querySelectorAll('h3');
        if (subsections.length > 0) {
            const subList = document.createElement('ul');
            subList.className = 'toc-sublist';
            
            subsections.forEach(subsection => {
                // 为子标题创建ID（如果没有）
                if (!subsection.id) {
                    const subId = `${sectionId}-${subsection.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')}`;
                    subsection.id = subId;
                }
                
                const subItem = document.createElement('li');
                subItem.className = 'toc-subitem';
                
                const subLink = document.createElement('a');
                subLink.href = `#${subsection.id}`;
                subLink.textContent = subsection.textContent;
                subLink.setAttribute('data-section', subsection.id);
                
                subItem.appendChild(subLink);
                subList.appendChild(subItem);
            });
            
            listItem.appendChild(subList);
        }
    });
}

// 高亮当前章节
function highlightCurrentSection() {
    const scrollPosition = window.scrollY + 100; // 添加偏移量以提前高亮
    const sections = document.querySelectorAll('.section');
    const tocLinks = document.querySelectorAll('.toc-list a');
    
    // 移除所有高亮
    tocLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 找到当前章节并高亮
    let currentSection = null;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.id;
            
            // 高亮主章节
            const mainLink = document.querySelector(`.toc-list a[data-section="${currentSection}"]`);
            if (mainLink) {
                mainLink.classList.add('active');
            }
            
            // 检查子章节
            const subsections = section.querySelectorAll('h3');
            subsections.forEach(subsection => {
                const subsectionTop = subsection.offsetTop;
                
                if (scrollPosition >= subsectionTop && scrollPosition < subsectionTop + 200) {
                    // 高亮子章节
                    const subLink = document.querySelector(`.toc-list a[data-section="${subsection.id}"]`);
                    if (subLink) {
                        subLink.classList.add('active');
                    }
                }
            });
        }
    });
}

// 创建返回顶部按钮
function createBackToTopButton() {
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.setAttribute('aria-label', '返回顶部');
    
    document.body.appendChild(backToTopButton);
    
    // 显示/隐藏返回顶部按钮
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // 点击返回顶部
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 创建阅读进度指示器
function createReadingProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;
        
        const progress = (scrollTop / documentHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

// 创建图表可视化
function createCharts() {
    // 检查是否已加载Chart.js
    if (typeof Chart === 'undefined') {
        // 如果没有加载Chart.js，则加载它
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initializeCharts;
        document.head.appendChild(script);
    } else {
        // 如果已加载Chart.js，则直接初始化图表
        initializeCharts();
    }
}

// 初始化图表
function initializeCharts() {
    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.innerHTML = `
        <h3>研究结果可视化</h3>
        <div class="charts">
            <div class="chart-wrapper">
                <canvas id="performanceChart"></canvas>
            </div>
            <div class="chart-wrapper">
                <canvas id="efficiencyChart"></canvas>
            </div>
        </div>
    `;
    
    // 将图表容器添加到实验部分
    const experimentsSection = document.getElementById('experiments');
    if (experimentsSection) {
        const sectionContent = experimentsSection.querySelector('.section-content');
        sectionContent.appendChild(chartContainer);
        
        // 创建性能对比图表
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['结果监督', '过程监督'],
                datasets: [{
                    label: 'MATH测试集准确率 (%)',
                    data: [58, 78],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(75, 192, 192, 0.5)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '不同监督方法的性能对比'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        // 创建数据效率图表
        const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
        new Chart(efficiencyCtx, {
            type: 'line',
            data: {
                labels: ['20%', '40%', '60%', '80%', '100%'],
                datasets: [{
                    label: '均匀采样',
                    data: [45, 55, 62, 68, 72],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: '主动学习(混合策略)',
                    data: [58, 67, 72, 76, 78],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '数据效率对比'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: '准确率 (%)'
                        },
                        min: 40,
                        max: 80
                    },
                    x: {
                        title: {
                            display: true,
                            text: '使用的数据比例'
                        }
                    }
                }
            }
        });
    }
}

// 初始化音频播放功能
function initAudioPlayers() {
    const audioPlayers = document.querySelectorAll('.audio-player');
    
    audioPlayers.forEach(player => {
        const audio = player.querySelector('audio');
        const button = player.querySelector('.audio-button');
        const nextSectionId = audio.dataset.nextSection;
        
        // 创建进度条
        const progressBar = document.createElement('div');
        progressBar.className = 'audio-progress';
        player.appendChild(progressBar);
        
        // 点击按钮播放/暂停音频
        button.addEventListener('click', function() {
            if (audio.paused) {
                // 暂停所有其他正在播放的音频
                document.querySelectorAll('.audio-player audio').forEach(otherAudio => {
                    if (otherAudio !== audio && !otherAudio.paused) {
                        otherAudio.pause();
                        otherAudio.parentElement.classList.remove('audio-playing');
                    }
                });
                
                // 播放当前音频
                audio.play();
                player.classList.add('audio-playing');
                button.innerHTML = '<span class="audio-icon">⏸</span> 暂停解读';
            } else {
                // 暂停当前音频
                audio.pause();
                player.classList.remove('audio-playing');
                button.innerHTML = '<span class="audio-icon">🔊</span> 收听解读';
            }
        });
        
        // 更新进度条
        audio.addEventListener('timeupdate', function() {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progress}%`;
        });
        
        // 音频播放结束时
        audio.addEventListener('ended', function() {
            // 重置按钮和进度条
            player.classList.remove('audio-playing');
            button.innerHTML = '<span class="audio-icon">🔊</span> 收听解读';
            progressBar.style.width = '0';
            
            // 如果有下一个部分，自动滚动到该部分
            if (nextSectionId) {
                const nextSection = document.getElementById(nextSectionId);
                if (nextSection) {
                    // 滚动到下一个部分
                    setTimeout(() => {
                        window.scrollTo({
                            top: nextSection.offsetTop - 20,
                            behavior: 'smooth'
                        });
                        
                        // 可选：自动播放下一个部分的音频
                        const nextAudioPlayer = nextSection.querySelector('.audio-player');
                        if (nextAudioPlayer) {
                            setTimeout(() => {
                                const nextAudioButton = nextAudioPlayer.querySelector('.audio-button');
                                if (nextAudioButton) {
                                    nextAudioButton.click();
                                }
                            }, 1000); // 等待滚动完成后再播放
                        }
                    }, 500);
                }
            }
        });
    });
}
