class EmailSecurityAnalyzer {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const emailInput = document.getElementById('emailInput');
        const domainInput = document.getElementById('domainInput');

        analyzeBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const domain = domainInput.value.trim();
            
            if (!email && !domain) {
                this.showError('Please enter an email address or domain to analyze.');
                return;
            }
            
            this.analyzeEmail(email, domain);
        });

        // Enter key support
        [emailInput, domainInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    analyzeBtn.click();
                }
            });
        });
    }

    async analyzeEmail(email, domain) {
        this.showLoading();
        
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, domain })
            });
            
            const results = await response.json();
            this.displayResults(results);
        } catch (error) {
            this.showError('Analysis failed. Please try again.');
            console.error('Error:', error);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('loadingSection').classList.remove('hidden');
        document.getElementById('resultsSection').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSection').classList.add('hidden');
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');
        
        let html = '';
        
        // Email Validation Results
        if (results.emailValidation) {
            html += this.createResultItem(
                'Email Validation',
                this.formatEmailValidation(results.emailValidation)
            );
        }
        
        // DNS Analysis Results
        if (results.dnsAnalysis) {
            html += this.createResultItem(
                'DNS Analysis',
                this.formatDNSAnalysis(results.dnsAnalysis)
            );
        }
        
        // Security Score
        if (results.securityScore) {
            html += this.createResultItem(
                'Security Score',
                this.formatSecurityScore(results.securityScore)
            );
        }
        
        // Recommendations
        if (results.recommendations) {
            html += this.createResultItem(
                'Security Recommendations',
                this.formatRecommendations(results.recommendations)
            );
        }
        
        resultsContent.innerHTML = html;
        resultsSection.classList.remove('hidden');
    }

    createResultItem(title, content) {
        return `
            <div class="result-item">
                <h3><i class="fas fa-check-circle"></i> ${title}</h3>
                ${content}
            </div>
        `;
    }

    formatEmailValidation(validation) {
        return `
            <p><strong>Format:</strong> ${validation.isValid ? '✅ Valid' : '❌ Invalid'}</p>
            <p><strong>Domain:</strong> ${validation.domain}</p>
            <p><strong>Provider:</strong> ${validation.provider || 'Unknown'}</p>
            <p><strong>Disposable:</strong> ${validation.isDisposable ? '⚠️ Yes' : '✅ No'}</p>
        `;
    }

    formatDNSAnalysis(dns) {
        let html = '';
        
        if (dns.mxRecords && dns.mxRecords.length > 0) {
            html += '<p><strong>MX Records:</strong></p><ul>';
            dns.mxRecords.forEach(record => {
                
