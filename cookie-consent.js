class CookieConsent {
    constructor(options = {}) {
        this.labels = Object.assign({
            title: "Setări cookie",
            description: "Folosim cookie-uri pentru a îmbunătăți experiența. Poți accepta toate cookie-urile sau să alegi preferințele.",
            necessary: "Necesare",
            necessaryDesc: "Cookie-urile esențiale sunt necesare pentru funcționarea site-ului.",
            analytics: "Analitice",
            analyticsDesc: "Cookie-uri pentru statistici și îmbunătățiri (ex: Google Analytics).",
            thirdParty: "3rd Party",
            thirdPartyDesc: "Servicii terțe (video/embed, ads).",
            acceptAll: "Acceptă tot",
            rejectAll: "Refuză tot",
            save: "Salvează preferințele",
            manage: "Setări cookie",
            policyLinkText: "Politica de cookie",
            policyUrl: "#"
        }, options.labels || {});

        this.cookieName = options.cookieName || "cookie_consent";
        this.cookieExpireDays = options.cookieExpireDays || 365;
        this.storageKey = options.storageKey || "cookie_consent_prefs";
        this.autoApply = options.autoApply !== undefined ? options.autoApply : true;

        this.init();
    }

    init() {
        this.injectStyles();
        this.createElements();
        this.addEventListeners();
        this.loadPrefs();

        if (this.prefs) {
            if (this.autoApply) this.applyConsent();
        } else {
            this.openModal();
        }
    }

    /** Salvează preferințele în localStorage și cookie */
    savePrefs(prefs) {
        this.prefs = prefs;
        // Salvăm în localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(prefs));
        // Salvăm în cookie (opțional)
        const d = new Date();
        d.setTime(d.getTime() + (this.cookieExpireDays*24*60*60*1000));
        document.cookie = `${this.cookieName}=${encodeURIComponent(JSON.stringify(prefs))};expires=${d.toUTCString()};path=/`;

        // Aplicăm imediat preferințele
        this.applyConsent();
    }

    /** Încarcă preferințele din localStorage sau cookie */
    loadPrefs() {
        let prefs = null;
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                prefs = JSON.parse(stored);
            } catch(e) {
                prefs = null;
            }
        } else {
            // Încearcă din cookie
            const match = document.cookie.match(new RegExp('(^| )' + this.cookieName + '=([^;]+)'));
            if (match) {
                try {
                    prefs = JSON.parse(decodeURIComponent(match[2]));
                } catch(e) { prefs = null; }
            }
        }
        this.prefs = prefs;
        return prefs;
    }

    injectStyles() {
        const style = document.createElement("style");
        style.textContent = `
#cookieConsentOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 10000;
  display: none;
}

#cookieConsentOverlay.show {
  display: block;
}

#cookieConsentBtn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9997;
  background:#185A7D;
  color:white;
  border:none;
  border-radius:8px;
  width:44px;
  height:44px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  box-shadow:0 6px 18px rgba(0,0,0,0.15);
}
#cookieConsentBtn:hover {
  background: #387A9D;
  transform: scale(1.1);
}
#cookieConsentModal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10001;
  width: 50vw;
  max-width: calc(100% - 40px);
  background: white;
  color: #222;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
  display: none;
  overflow: hidden;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
#cookieConsentModal.show { display: block; }

#cookieConsentModal .cc-header {
  background: #185A7D;
  color: #fff;
  padding: 14px 16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
#cookieConsentModal .cc-header h4 { margin:0; font-size:16px; font-weight:700; }

#cookieConsentModal .cc-body {
  padding: 14px 16px;
  font-size:14px;
  color:#333;
}
.cc-category {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 0;
  border-top:1px solid #f1f1f1;
}
.cc-category:first-of-type { border-top: none; }
.cc-category .desc { font-size:12px; color:#666; margin-top:4px; }

#cookieConsentModal .cc-footer {
  display:flex;
  gap:8px;
  padding:12px 16px;
  border-top:1px solid #eee;
  justify-content: flex-end;
  background:#fafafa;
}

.cc-btn {
  padding:8px 12px;
  border-radius:8px;
  border: none;
  cursor:pointer;
  font-weight:600;
}
.cc-btn.primary { background:#185A7D; color:white; }
.cc-btn.ghost { background:transparent; border:1px solid #ddd; color:#333; }

.switch {
  position: relative;
  width:44px;
  height:24px;
}
.switch input { display:none; }
.switch .track {
  position:absolute; inset:0; border-radius:24px; background:#e6e6e6; transition: all .2s;
}
.switch .thumb {
  position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:white; box-shadow:0 2px 6px rgba(0,0,0,0.12); transition: all .2s;
}
.switch input:checked + .track { background:#185A7D; }
.switch input:checked + .track .thumb { transform: translateX(20px); }

.cc-manage {
  display:block;
  text-decoration:underline;
  color:#185A7D;
  font-size:13px;
  margin-top:8px;
}

@media (max-width:768px) {
  #cookieConsentModal { left:10px; right:10px; width: 80vw; transform: translate( 10%, -50%); }
}

@media (max-width:420px) {
  #cookieConsentModal { left:10px; right:10px; width: 80vw; }
}

#cookieConsentBtn svg {
    pointer-events: none;
}
        `;
        document.head.appendChild(style);
    }

    createElements() {

        /** OVERLAY */
        this.overlay = document.createElement("div");
        this.overlay.id = "cookieConsentOverlay";
        document.body.appendChild(this.overlay);

        /** BUTTON */
        this.openBtn = document.createElement('button');
        this.openBtn.id = 'cookieConsentBtn';
        this.openBtn.type = 'button';
        this.openBtn.innerHTML = `
            <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16H9.01M12 11H12.01M7 10H7.01M15 16H15.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C12 5.76142 13.7909 8 16 8C16 10.2091 18.2386 12 21 12Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        this.openBtn.setAttribute('aria-controls','cookieConsentModal');
        document.body.appendChild(this.openBtn);

        /** MODAL */
        this.modal = document.createElement('div');
        this.modal.id = 'cookieConsentModal';
        this.modal.setAttribute('role','dialog');
        this.modal.setAttribute('aria-modal','true');
        this.modal.innerHTML = `
      <div class="cc-header">
        <h4>${this.labels.title}</h4>
        <button type="button" aria-label="Închide" class="cc-close" style="background:transparent;border:none;color:white;font-size:40px;cursor:pointer;">&times;</button>
      </div>
      <div class="cc-body">
        <p>${this.labels.description} <a class="cc-policy" href="${this.labels.policyUrl}" target="_blank" rel="noopener">${this.labels.policyLinkText}</a></p>

        <div class="cc-category" data-cat="necessary">
          <div>
            <strong>${this.labels.necessary}</strong>
            <div class="desc">${this.labels.necessaryDesc}</div>
          </div>
          <div class="switch" aria-hidden="true">
            <input type="checkbox" id="cc-necessary" checked disabled />
            <span class="track"><span class="thumb"></span></span>
          </div>
        </div>

        <div class="cc-category" data-cat="analytics">
          <div>
            <strong>${this.labels.analytics}</strong>
            <div class="desc">${this.labels.analyticsDesc}</div>
          </div>
          <label class="switch" aria-label="${this.labels.analytics}">
            <input type="checkbox" id="cc-analytics" />
            <span class="track"><span class="thumb"></span></span>
          </label>
        </div>

        <div class="cc-category" data-cat="thirdParty">
          <div>
            <strong>${this.labels.thirdParty}</strong>
            <div class="desc">${this.labels.thirdPartyDesc}</div>
          </div>
          <label class="switch" aria-label="${this.labels.thirdParty}">
            <input type="checkbox" id="cc-thirdparty" />
            <span class="track"><span class="thumb"></span></span>
          </label>
        </div>

      </div>

      <div class="cc-footer">
        <button class="cc-btn ghost" data-action="reject">${this.labels.rejectAll}</button>
        <button class="cc-btn ghost" data-action="accept-necessary">${this.labels.necessary}</button>
        <button class="cc-btn primary" data-action="accept-all">${this.labels.acceptAll}</button>
        <button class="cc-btn primary" data-action="save">${this.labels.save}</button>
      </div>
        `;
        document.body.appendChild(this.modal);
    }

    addEventListeners() {
        this.openBtn.addEventListener('click', () => this.toggleModal());
        this.modal.querySelector('.cc-close').addEventListener('click', () => this.closeModal());

        this.overlay.addEventListener('click', () => this.closeModal());

        this.modal.querySelector('[data-action="accept-all"]').addEventListener('click', () => {
            this.savePrefs({ necessary:true, analytics:true, thirdParty:true });
            this.closeModal();
        });

        this.modal.querySelector('[data-action="reject"]').addEventListener('click', () => {
            this.savePrefs({ necessary:true, analytics:false, thirdParty:false });
            this.closeModal();
        });

        this.modal.querySelector('[data-action="accept-necessary"]').addEventListener('click', () => {
            this.savePrefs({ necessary:true, analytics:false, thirdParty:false });
            this.closeModal();
        });

        this.modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const analytics = !!this.modal.querySelector('#cc-analytics').checked;
            const thirdParty = !!this.modal.querySelector('#cc-thirdparty').checked;
            this.savePrefs({ necessary:true, analytics, thirdParty });
            this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) this.closeModal();
        });
    }


    toggleModal() {
        this.modal.classList.toggle('show');
        this.overlay.classList.toggle('show');
        this.updateUIFromPrefs();
    }

    openModal() {
        this.modal.classList.add('show');
        this.overlay.classList.add('show');
        this.updateUIFromPrefs();
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.overlay.classList.remove('show');
    }


    updateUIFromPrefs() {
        const analyticsCB = this.modal.querySelector('#cc-analytics');
        const thirdCB = this.modal.querySelector('#cc-thirdparty');
        if (!this.prefs) {
            analyticsCB.checked = false;
            thirdCB.checked = false;
        } else {
            analyticsCB.checked = !!this.prefs.analytics;
            thirdCB.checked = !!this.prefs.thirdParty;
        }
    }

    applyConsent() {
        const prefs = this.prefs || { necessary:true, analytics:false, thirdParty:false };
        const nodes = document.querySelectorAll('script[type="text/plain"][data-cookie-category], iframe[data-cookie-category]');
        nodes.forEach(node => {
            const cat = node.getAttribute('data-cookie-category');
            const shouldEnable =
                (cat === 'analytics' && prefs.analytics) ||
                (cat === 'third-party' && prefs.thirdParty) ||
                (cat === 'necessary');

            if (shouldEnable) this.enableNode(node);
            else this.disableNode(node);
        });
        window.dispatchEvent(new CustomEvent('cookieConsentApplied', { detail: prefs }));
    }

    enableNode(node) {
        if (node.tagName.toLowerCase() === 'script') {
            if (node.getAttribute('data-consent-inserted') === '1') return;
            const s = document.createElement('script');
            s.type = node.getAttribute('data-type') || 'text/javascript';
            if (node.src) s.src = node.src;
            s.text = node.textContent || '';
            s.setAttribute('data-consent-inserted', '1');
            for (let i = 0; i < node.attributes.length; i++) {
                const att = node.attributes[i];
                if (['type','data-cookie-category','data-type'].includes(att.name)) continue;
                s.setAttribute(att.name, att.value);
            }
            node.parentNode.insertBefore(s, node.nextSibling);
            node.setAttribute('data-consent-inserted', '1');
        } else if (node.tagName.toLowerCase() === 'iframe') {
            const ds = node.getAttribute('data-src');
            if (ds && node.src !== ds) node.src = ds;
        }
    }

    disableNode(node) {
        if (node.tagName.toLowerCase() === 'script') {
            const next = node.nextSibling;
            if (next && next.getAttribute && next.getAttribute('data-consent-inserted') === '1')
                next.parentNode.removeChild(next);
            node.removeAttribute('data-consent-inserted');
        } else if (node.tagName.toLowerCase() === 'iframe') {
            if (node.src) node.setAttribute('data-src', node.src);
            node.removeAttribute('src');
        }
    }
}

/* ---------- initializare automată ---------- */
document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent({
        labels: { policyUrl:'/cookie-policy.html' },
        autoApply:true
    });
});
