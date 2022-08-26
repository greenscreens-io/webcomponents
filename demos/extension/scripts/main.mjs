(async ()=>{ 
    async function start() {
        await GSComponents.waitFor('gs-nav');
        const cmp = GSComponents.find('gs-nav');
        if (!cmp) throw new Error('Sidebar menu not initialized!');
        cmp.addEventListener('action', (e) => {
            const action = e.detail.data.action;
            if (!action) return;
            console.log(`Sidebar menu action: ${action}`);
        });
    }    
})();

