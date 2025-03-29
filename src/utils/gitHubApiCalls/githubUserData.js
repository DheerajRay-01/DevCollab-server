import axios from 'axios';

const getGitHubUserData = async (access_token) => {
    const languagesUsed = new Set();
    let pushEvents = 0;
  
    try {
        // Fetch user details
        const response = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!response || !response.data) {
            console.error("Error fetching GitHub user");
            return null;
        }

        const { login } = response.data;

        // Fetch user repositories
        const repoData = await axios.get(`https://api.github.com/users/${login}/repos`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        // const repoList = repoData?.data?.map((repo) => ({
        //     id: repo.id,
        //     name: repo.name,
        // }));
        

        for (const repo of repoData.data) {
            if (repo.language) {
                languagesUsed.add(repo.language);
            }
        }

        // Fetch user events (to count total contributions)
        const eventsData = await axios.get(`https://api.github.com/users/${login}/events`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        for (const event of eventsData.data) {
            if (event.type === "PushEvent") {
                pushEvents += event.payload.commits.length; // Count commits in push events
            }
        }

        // Fetch starred repositories count
        const starredData = await axios.get(`https://api.github.com/users/${login}/starred`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        return {
            ...response.data,
            top_languages: Array.from(languagesUsed), // Convert Set to Array
            total_contributions: pushEvents,
            starred_repos: starredData.data.length // Total starred repositories
           
        };
    } catch (error) {
        console.error("Error fetching GitHub user:", error.response?.data || error.message);
        return null;
    }
};



const getAllRepoData = async (access_token) => {
    try {
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const repoList = response?.data?.map((repo) => ({
            id: repo.id,
            name: repo.name,
            updated_at: repo.updated_at 
                ? new Date(repo.updated_at).toLocaleDateString() 
                : "No update date"
        }));

        return repoList;
    } catch (error) {
        console.log("Error fetching repos:", error);
        return []; // Return an empty array in case of an error
    }
};




export { getGitHubUserData , getAllRepoData};



