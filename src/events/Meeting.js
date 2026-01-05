import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import authFetch, { getAuthUserId } from "../services/authFetch";

const Meeting = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const containerRef = useRef(null);
    const apiRef = useRef(null);
    const isAttemptingJoin = useRef(false);
    const hasAttemptedExpertJoin = useRef(false);

    // States
    const [token, setToken] = useState(null);
    const [roomPassword, setRoomPassword] = useState(null);
    const [isModerator, setIsModerator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meetingInfo, setMeetingInfo] = useState(null);
    const [showSelection, setShowSelection] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState(""); // New email state
    const [isJoining, setIsJoining] = useState(false);
    const [waitingForHost, setWaitingForHost] = useState(false); // New Waiting State

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const PUBLIC_API_BASE = `${backendUrl}/api/public/meeting`;
    const EXPERT_API_BASE = `${backendUrl}/api/expert`;

    // Polling Function for Waiting Guests
    const pollForStart = () => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${PUBLIC_API_BASE}/${roomId}/info`);
                const data = await res.json();
                if (data.isStarted) {
                    clearInterval(interval);
                    setWaitingForHost(false);
                    setShowSelection(true); // Allow join now
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    };

    // 1. Fetch meeting info AND handle expert auto-join
    useEffect(() => {
        const initializeMeeting = async () => {
            console.log("🚀 [Meeting] Initializing...");
            try {
                setLoading(true);
                setError(null);

                // Check for ?role=moderator in URL
                const searchParams = new URLSearchParams(window.location.search);
                const requestedRole = searchParams.get('role');

                // Fetch Public Meeting Info
                console.log(`📡 [Meeting] Fetching info for roomId: ${roomId}`);
                const response = await fetch(`${PUBLIC_API_BASE}/${roomId}/info`);
                const data = await response.json();

                if (response.ok) {
                    setMeetingInfo(data);

                    // Check Meeting Status
                    if (!data.isStarted && !requestedRole) { // If guest and not started
                        // Check active session to see if *I* am the expert
                        const { getAccessToken, getAuthUserId } = await import('../services/authFetch');
                        const userId = getAuthUserId();
                        const isMyEvent = data.expert && userId; // Simplified check, ideally check ID match

                        if (!userId) {
                            console.log("⏳ [Meeting] Meeting not started yet. Enabling Waiting Room.");
                            setWaitingForHost(true);
                            setLoading(false);
                            pollForStart(); // Start checking
                            return;
                        }
                    }

                    console.log("✅ [Meeting] Info received:", data);
                } else {
                    console.warn("⚠️ [Meeting] Info fetch failed:", data.error);
                    setError(data.error || "Görüşme bulunamadı.");
                    setLoading(false);
                    return;
                }

                // Check for existing session
                const { getAccessToken, getAuthUserId } = await import('../services/authFetch');
                const accessToken = getAccessToken();
                const userId = getAuthUserId();

                console.log("🔐 [Meeting] Session check:", {
                    hasAccessToken: !!accessToken,
                    userId,
                    hasUserFromContext: !!user,
                    requestedRole
                });

                if (accessToken && userId) {
                    console.log("🔄 [Meeting] Found expert session, attempting auto-join...");
                    isAttemptingJoin.current = true;
                    // Note: attemptExpertJoin sets loading(false) internally on finish
                    await attemptExpertJoin(userId);
                    isAttemptingJoin.current = false;
                    hasAttemptedExpertJoin.current = true;
                } else if (requestedRole === 'moderator') {
                    // Force login if moderator role requested but no session
                    console.log("✋ [Meeting] Moderator role requested but no session, redirecting to login...");
                    navigate(`/login?returnUrl=/meeting/${roomId}?role=moderator`);
                } else {
                    console.log("👋 [Meeting] No expert session found, showing selection.");
                    setShowSelection(true);
                    setLoading(false);
                }
            } catch (err) {
                console.error("❌ [Meeting] Initialization error:", err);
                setError("Görüşme yüklenirken bir hata oluştu.");
                setLoading(false);
            }
        };

        initializeMeeting();

    }, [roomId, navigate]);

    // 2. Watcher for user context stabilization
    // If user loads later and we haven't tried joining yet, try now
    useEffect(() => {
        const checkContextAuth = async () => {
            if (token || isAttemptingJoin.current || hasAttemptedExpertJoin.current) return;

            if (user?._id || user?.id) {
                const userId = user._id || user.id;
                console.log(`⭐ [Meeting] Auth context stabilized for user: ${userId}. Attempting join...`);
                isAttemptingJoin.current = true;
                await attemptExpertJoin(userId);
                isAttemptingJoin.current = false;
                hasAttemptedExpertJoin.current = true;
            }
        };

        checkContextAuth();
    }, [user, token]);

    const attemptExpertJoin = async (userId) => {
        if (token) {
            console.log("⏩ [Meeting] Expert join skipped: already have token.");
            return;
        }

        try {
            const { getAccessToken, authFetch } = await import('../services/authFetch');
            if (!getAccessToken()) {
                console.log("ℹ️ [Meeting] No access token available for expert join.");
                setShowSelection(true);
                setLoading(false);
                return;
            }

            console.log(`🔑 [Meeting] Fetching expert token for user: ${userId}`);
            setLoading(true);
            const tokenUrl = `${EXPERT_API_BASE}/${userId}/events/${roomId}/token`;
            const response = await authFetch(tokenUrl);
            const data = await response.json();

            if (data.token) {
                console.log(`✅ [Meeting] Expert token received (Moderator: ${data.isModerator})`);
                setToken(data.token);
                setRoomPassword(data.roomPassword); // Store password for free tier automation
                setIsModerator(data.isModerator);
                setShowSelection(false);
                setError(null);

                // TRIGGER START if I am the expert
                if (data.isModerator) {
                    await authFetch(`${EXPERT_API_BASE}/${userId}/events/${roomId}/start`, { method: 'POST' });
                }
            } else {
                console.warn("⚠️ [Meeting] No token returned for expert join:", data.error || "No error detail");
                setShowSelection(true);
            }
        } catch (err) {
            console.error("❌ [Meeting] Expert join failed:", err);
            setShowSelection(true);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestJoin = async (e) => {
        if (e) e.preventDefault();
        if (!guestName.trim() || !guestEmail.trim()) return;

        try {
            setIsJoining(true);
            setError(null);
            // Pass email in query params
            const accessUrl = `${PUBLIC_API_BASE}/${roomId}/access?name=${encodeURIComponent(guestName)}&email=${encodeURIComponent(guestEmail)}`;
            const response = await fetch(accessUrl);
            const data = await response.json();

            if (data.token) {
                console.log("✅ Guest token received");
                setToken(data.token);
                setRoomPassword(data.roomPassword); // Store password for silent join
                setIsModerator(false);
                setShowSelection(false);
            } else {
                setError(data.error || "E-posta doğrulanamadı veya giriş izni bulunamadı.");
            }
        } catch (err) {
            console.error("❌ Guest join error:", err);
            setError("Giriş yapılırken bir hata oluştu.");
        } finally {
            setIsJoining(false);
        }
    };

    // 3. Initialize Jitsi when token is available and NOT loading
    useEffect(() => {
        if (!token || showSelection || loading) return;

        if (!window.JitsiMeetExternalAPI) {
            console.error("Jitsi Meet External API not found.");
            setError("Jitsi API yüklenemedi. Lütfen sayfayı yenileyin.");
            return;
        }

        const domain = process.env.REACT_APP_JITSI_DOMAIN || "meet.jit.si";
        const isPublicJitsi = domain === "meet.jit.si";

        // IMPORTANT: On meet.jit.si (free tier), custom JWTs cause "Authentication failed".
        // We only send the token if it's NOT meet.jit.si OR it's a JaaS token (vpaas).
        const jitsiJwt = (isPublicJitsi && token && !token.startsWith("vpaas-")) ? null : token;

        console.log("🎬 [Meeting] Initializing Jitsi...", {
            isModerator,
            hasPassword: !!roomPassword,
            isPublicJitsi
        });

        const options = {
            roomName: roomId,
            width: "100%",
            height: "100%",
            parentNode: containerRef.current,
            // Only add jwt key if we have a valid token for this domain
            ...(jitsiJwt ? { jwt: jitsiJwt } : {}),
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false,
                enableWelcomePage: false,
                disableThirdPartyRequests: true,
                lobby: { enabled: false },
                requireDisplayName: true,
                // Silent join with password for guests on public Jitsi
                ...(isPublicJitsi && roomPassword ? { autoSilentPassword: roomPassword } : {})
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_BACKGROUND: '#1a1a1a',
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            }
        };

        try {
            if (apiRef.current) apiRef.current.dispose();

            const api = new window.JitsiMeetExternalAPI(domain, options);
            apiRef.current = api;

            // Moderator Logic: Set password upon joining
            if (isModerator && isPublicJitsi && roomPassword) {
                api.addEventListener('videoConferenceJoined', () => {
                    console.log("🔒 [Meeting] Moderator joined, setting room password...");
                    api.executeCommand('password', roomPassword);
                });
            }

            api.addEventListeners({
                readyToClose: () => navigate('/dashboard/events')
            });
        } catch (jitsiErr) {
            console.error("Jitsi initialization error:", jitsiErr);
            setError("Görüşme başlatılamadı.");
        }

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
        };
    }, [token, showSelection, loading, roomId, navigate, isModerator, roomPassword]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (waitingForHost) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mb-6 relative mx-auto w-24 h-24">
                        {meetingInfo?.expert?.image ? (
                            <img
                                src={meetingInfo.expert.image}
                                alt={meetingInfo.expert.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl mx-auto">
                                👨‍🏫
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-400 border-2 border-white rounded-full animate-pulse"></span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Görüşme Henüz Başlamadı
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Uzmanınız {meetingInfo?.expert?.name} görüşmeyi başlattığında otomatik olarak bağlanacaksınız.
                    </p>

                    <div className="flex items-center justify-center space-x-2 text-sm text-indigo-600 bg-indigo-50 py-3 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span>Bekleniyor...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (showSelection) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <span className="text-3xl">🎥</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-2">Canlı Görüşmeye Katıl</h2>
                        <p className="text-blue-100 text-center opacity-90">{meetingInfo?.title || "Görüşme"}</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-around text-sm text-gray-500 bg-gray-50 p-4 rounded-2xl">
                            <div className="text-center">
                                <p className="font-semibold text-gray-800">{meetingInfo?.expertName}</p>
                                <p>Uzman</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200"></div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-800">{meetingInfo?.time}</p>
                                <p>{meetingInfo?.date}</p>
                            </div>
                        </div>

                        <form onSubmit={handleGuestJoin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                    Adınız
                                </label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Adınız ve Soyadınız"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                    E-Posta Adresiniz
                                </label>
                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isJoining || !guestName.trim() || !guestEmail.trim()}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
                            >
                                {isJoining ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Görüşmeye Katıl</span>
                                        <span className="text-xl">→</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="px-3 bg-white text-gray-300 font-semibold tracking-widest">VEYA</span></div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-4">Uzman mısınız?</p>
                            <button
                                onClick={() => navigate(`/login?returnUrl=/meeting/${roomId}`)}
                                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                            >
                                Uzman Girişi Yap <span className="ml-1">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 max-w-md">
                    <p className="text-red-500 text-4xl mb-4">⚠️</p>
                    <h3 className="text-xl font-bold mb-2">Hata</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 rounded-lg">Tekrar Dene</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden relative">
            <div className="absolute top-4 left-4 z-50 flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold tracking-wide">CANLI GÖRÜŞME</span>
            </div>

            <div
                ref={containerRef}
                className="w-full h-full"
            />
        </div>
    );
};

export default Meeting;
