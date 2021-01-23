import {Link as RouterLink} from "react-router-dom";

import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

/* Config */
import {APP_NAME} from "../../config/config.json";

export default function Copyright() {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			<Link color="inherit" component={RouterLink} to="/">
				{APP_NAME}
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
}
