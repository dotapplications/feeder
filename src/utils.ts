import { capabilities, toolDefinitions } from "./config/agent_config";

export const chunkingConfig = {
  minLength: 1000,
  maxLength: 2000,
  splitter: "sentence",
  overlap: 100,
  delimiters: "",
} as any;

export const toolDefinisitionsStringified = () => {
  const result = Object.values(toolDefinitions)
    .map(
      (tool) => `
    - ${tool.name}: ${tool.description}
      Sub-tools: ${tool.subTools.join(", ")}
  `
    )
    .join("\n");

  return result;
};

export const capabilitiesInreadableFormat = () => {
  const string_capabilities = capabilities
    .map((capability) => {
      return `
    - ${capability} 
    `;
    })
    .join("\n");
  return string_capabilities;
};
