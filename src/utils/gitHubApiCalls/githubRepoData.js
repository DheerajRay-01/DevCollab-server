import axios from "axios";
import { ApiError } from "../ApiError.js";

export const fetchSearchedRepoData = async (login, access_token, repo) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${login}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    // console.log(response.data);
    

    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub repo:", error);
    throw new ApiError(500, "Internal Server Error while fetching repository");
  }
};

export const fetchCompleteRepoData = async (login, access_token, repo) => {
  try {
    const repoApi = `https://api.github.com/repos/${login}/${repo}`;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/vnd.github.v3+json",
    };

    // **Parallel API Calls using Promise.all()**
    const [
      repoResponse,
      languagesResponse,
      contributorsResponse,
      issuesResponse,
    ] = await Promise.all([
      axios.get(repoApi, { headers }),
      axios.get(`${repoApi}/languages`, { headers }),
      axios.get(`${repoApi}/contributors`, { headers }),
      axios.get(`${repoApi}/issues`, { headers }),
    ]);

    // Extracting data
    const repositoryData = repoResponse.data;

    const languages = languagesResponse?.data || {};
    const contributors =
      contributorsResponse?.data?.length > 0
        ? contributorsResponse.data
            .slice(0, 10) // Get only the top 10 contributors
            .map((contributor) => ({
              name: contributor.login,
              avatar_url: contributor.avatar_url,
              url: contributor.html_url,
            }))
        : [];
    const issues =
      issuesResponse?.data?.length > 0
        ? issuesResponse.data.slice(0, 10).map((issue) => ({
            url: issue.html_url,
            title: issue.title,
          }))
        : [];
          
        const repoData = {

          repoName: repositoryData?.name || "",
          url: repositoryData?.html_url || "#",
          login: repositoryData?.owner?.login || "",
          ownerProfile: repositoryData?.owner?.html_url || "",
          forksCount: repositoryData.forks_count || 0,
          starCount: repositoryData.stargazers_count || 0,
          contributorCount: contributorsResponse?.data?.length || 0,
          issuesCount: issuesResponse?.data?.length || 0,
          description: repositoryData?.description || "",
          license: repositoryData?.license?.name || "No License",
          issues_url: repositoryData?.full_name
            ? `https://github.com/${repositoryData?.full_name}/issues`
            : "#",
          contributors_url: repositoryData?.full_name
            ? `https://github.com/${repositoryData?.full_name}/graphs/contributors`
            : "#",
          fork_url: `https://github.com/${repositoryData.full_name}/network/members`,
          stars_url: `https://github.com/${repositoryData.full_name}/stargazers`,
          lastUpdate: repositoryData?.updated_at
            ? new Date(repositoryData.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
        };
        

    return { repoData, contributors, issues, languages };
  } catch (error) {
    console.error("Error fetching GitHub repo:", error);
    throw new ApiError(500, "Internal Server Error while fetching repository");
  }
};
