import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Get user analytics data from Firebase
export const getUserAnalytics = async (userId) => {
    try {
        // Get symptom analysis history
        const symptomRef = collection(db, 'symptomAnalysis');
        const symptomQuery = query(
            symptomRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        let symptomHistory = [];
        try {
            const symptomSnapshot = await getDocs(symptomQuery);
            symptomSnapshot.forEach((doc) => {
                symptomHistory.push({ id: doc.id, ...doc.data() });
            });
        } catch (err) {
            // Fallback without ordering
            if (err?.code === 'failed-precondition') {
                const fallbackQuery = query(symptomRef, where('userId', '==', userId));
                const snapshot = await getDocs(fallbackQuery);
                snapshot.forEach((doc) => {
                    symptomHistory.push({ id: doc.id, ...doc.data() });
                });
            }
        }

        // Get chat history
        const chatRef = collection(db, 'chats');
        const chatQuery = query(
            chatRef,
            where('userId', '==', userId)
        );

        let chatHistory = [];
        try {
            const chatSnapshot = await getDocs(chatQuery);
            chatSnapshot.forEach((doc) => {
                chatHistory.push({ id: doc.id, ...doc.data() });
            });
        } catch (err) {
            console.error('Error fetching chat history:', err);
        }

        // Calculate analytics
        const totalSessions = symptomHistory.length;
        const totalChats = chatHistory.length;

        // Calculate risk distribution
        let lowRisk = 0, mediumRisk = 0, highRisk = 0;
        symptomHistory.forEach((item) => {
            const risk = item.analysis?.riskLevel?.toLowerCase();
            if (risk === 'low') lowRisk++;
            else if (risk === 'medium') mediumRisk++;
            else if (risk === 'high') highRisk++;
        });

        const totalRiskAssessments = lowRisk + mediumRisk + highRisk;
        const riskDistribution = {
            low: totalRiskAssessments > 0 ? Math.round((lowRisk / totalRiskAssessments) * 100) : 0,
            medium: totalRiskAssessments > 0 ? Math.round((mediumRisk / totalRiskAssessments) * 100) : 0,
            high: totalRiskAssessments > 0 ? Math.round((highRisk / totalRiskAssessments) * 100) : 0
        };

        // Get weekly activity
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weeklySymptoms = symptomHistory.filter((item) => {
            const date = item.timestamp?.seconds
                ? new Date(item.timestamp.seconds * 1000)
                : new Date(item.createdAt);
            return date >= weekAgo;
        });

        const weeklyChats = chatHistory.filter((item) => {
            const date = item.timestamp?.seconds
                ? new Date(item.timestamp.seconds * 1000)
                : new Date(item.createdAt);
            return date >= weekAgo;
        });

        // Get most common symptoms/conditions
        const conditionsCount = {};
        symptomHistory.forEach((item) => {
            if (item.analysis?.conditions) {
                item.analysis.conditions.forEach((condition) => {
                    conditionsCount[condition] = (conditionsCount[condition] || 0) + 1;
                });
            }
        });

        const topConditions = Object.entries(conditionsCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([condition, count]) => ({ condition, count }));

        // Activity timeline (last 7 days)
        const activityByDay = {};
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayKey = date.toISOString().split('T')[0];
            activityByDay[dayKey] = {
                day: dayNames[date.getDay()],
                date: dayKey,
                symptoms: 0,
                chats: 0
            };
        }

        [...symptomHistory, ...chatHistory].forEach((item) => {
            const date = item.timestamp?.seconds
                ? new Date(item.timestamp.seconds * 1000)
                : new Date(item.createdAt);
            const dayKey = date.toISOString().split('T')[0];
            if (activityByDay[dayKey]) {
                if (item.symptoms !== undefined) {
                    activityByDay[dayKey].symptoms++;
                } else {
                    activityByDay[dayKey].chats++;
                }
            }
        });

        const activityTimeline = Object.values(activityByDay);

        return {
            totalSessions,
            totalChats,
            totalInteractions: totalSessions + totalChats,
            riskDistribution,
            weeklyActivity: {
                symptoms: weeklySymptoms.length,
                chats: weeklyChats.length
            },
            topConditions,
            activityTimeline,
            recentSymptoms: symptomHistory.slice(0, 5),
            hasData: totalSessions > 0 || totalChats > 0
        };
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        throw error;
    }
};
