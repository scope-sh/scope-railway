import axios from "axios";
import {
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
} from "viem/chains";

const ETHEREUM = mainnet.id;
const OPTIMISM = optimism.id;
const POLYGON = polygon.id;
const BASE = base.id;
const ARBITRUM = arbitrum.id;
const POLYGON_AMOY = polygonAmoy.id;
const BASE_SEPOLIA = baseSepolia.id;
const ARBITRUM_SEPOLIA = arbitrumSepolia.id;
const SEPOLIA = sepolia.id;
const OPTIMISM_SEPOLIA = optimismSepolia.id;

const CHAINS: ChainId[] = [
  ETHEREUM,
  SEPOLIA,
  OPTIMISM,
  OPTIMISM_SEPOLIA,
  POLYGON,
  POLYGON_AMOY,
  BASE,
  BASE_SEPOLIA,
  ARBITRUM,
  ARBITRUM_SEPOLIA,
];

type ChainId =
  | typeof ETHEREUM
  | typeof SEPOLIA
  | typeof OPTIMISM
  | typeof OPTIMISM_SEPOLIA
  | typeof POLYGON
  | typeof POLYGON_AMOY
  | typeof BASE
  | typeof BASE_SEPOLIA
  | typeof ARBITRUM
  | typeof ARBITRUM_SEPOLIA;

const githubClient = axios.create({
  baseURL: "https://api.github.com/repos/trustwallet/assets/git/trees/",
});

interface TreeResponse {
  sha: string;
  url: string;
  tree: Tree[];
}

interface Tree {
  path: string;
  sha: string;
}

async function getAssets(chainId: ChainId): Promise<string[]> {
  console.log("Getting assets for chain", chainId);
  function getChainName(chainId: ChainId): string | null {
    switch (chainId) {
      case ETHEREUM:
        return "ethereum";
      case OPTIMISM:
        return "optimism";
      case POLYGON:
        return "polygon";
      case BASE:
        return "base";
      case ARBITRUM:
        return "arbitrum";
      case POLYGON_AMOY:
        return null;
      case BASE_SEPOLIA:
        return null;
      case ARBITRUM_SEPOLIA:
        return null;
      case SEPOLIA:
        return "sepolia";
      case OPTIMISM_SEPOLIA:
        return null;
    }
  }

  const rootDir = await githubClient.get<TreeResponse>("master");
  const blockchainsSha = rootDir.data.tree.find(
    (item) => item.path === "blockchains"
  )?.sha;
  if (!blockchainsSha) {
    return [];
  }
  const blockchainsDir = await githubClient.get<TreeResponse>(blockchainsSha);
  const chainName = getChainName(chainId);
  if (!chainName) {
    return [];
  }
  const chainSha = blockchainsDir.data.tree.find(
    (item) => item.path === chainName
  )?.sha;
  if (!chainSha) {
    return [];
  }
  const chainDir = await githubClient.get<TreeResponse>(chainSha);
  const assetsSha = chainDir.data.tree.find(
    (item) => item.path === "assets"
  )?.sha;
  if (!assetsSha) {
    return [];
  }
  const assetsDir = await githubClient.get<TreeResponse>(assetsSha);
  return assetsDir.data.tree.map((item) => item.path.toLowerCase());
}

for (const chainId of CHAINS) {
  const assets = await getAssets(chainId);
  console.log(chainId, assets.length);
}
