const { useState, useEffect } = React;

const App = () => {
    const [currentView, setCurrentView] = useState('home');
    const [postId, setPostId] = useState(null);

    useEffect(() => {
        const handleNavigation = (e) => {
            if (typeof e.detail === 'object' && e.detail.view === 'post-detail') {
                setCurrentView('post-detail');
                setPostId(e.detail.postId);
            } else {
                setCurrentView(e.detail);
                setPostId(null);
            }
        };

        window.addEventListener('navigate', handleNavigation);
        return () => window.removeEventListener('navigate', handleNavigation);
    }, []);

    const renderCurrentView = () => {
        switch (currentView) {
            case 'home':
                return <HomeView />;
            case 'posts':
                return <PostsView />;
            case 'post-detail':
                return <PostDetailView
                    postId={postId}
                    onBack={() => {
                        const event = new CustomEvent('navigate', { detail: 'posts' });
                        window.dispatchEvent(event);
                    }}
                />;
            case 'categories':
                return <CategoriesView />;
            case 'tags':
                return <TagsView />;
            case 'dashboard':
                return <DashboardView />;
            case 'login':
                return <LoginView />;
            default:
                return <HomeView />;
        }
    };

    return (
        <ErrorBoundary>
            <AuthProvider>
                <div className="main-layout">
                    <Navigation />
                    <main className="main-content">
                        {renderCurrentView()}
                    </main>
                    <Footer />
                </div>
            </AuthProvider>
        </ErrorBoundary>
    );
};

// Make it globally available
window.App = App;