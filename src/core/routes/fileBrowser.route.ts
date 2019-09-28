import { route } from "./route";
import { serve, ServeProperties } from "../middleware/serve";
import { directoryTransform } from "../transforms/directory.transform";
import { jsonTransform } from "../transforms/json.transform";
import { method } from "../guards/method";

export interface FileBrowserProperties extends ServeProperties {

}

export const fileBrowser = (options: FileBrowserProperties) => {
	return route({
		guards: [ method.get() ],
		middleware: serve(options),
		transforms: [ directoryTransform, jsonTransform ]
	});
}
