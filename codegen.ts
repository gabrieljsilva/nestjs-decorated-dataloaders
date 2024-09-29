import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	schema: "./schema.gql",
	documents: ["testing/**/*.{ts,tsx}"],
	generates: {
		"testing/__generated__/": {
			preset: "client",
			presetConfig: {
				gqlTagName: "gql",
			},
		},
	},
};

export default config;
