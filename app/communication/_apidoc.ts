// This file contains common doc definitions

/* -------------------------------- COMMON ERROR DEFINITIONS ------------------------------------ */
/**
 * @apiDefine NotFoundError
 *
 * @apiError NotFound An object required for this request was not found
 *
 * @apiErrorExample {json} Not-Found-Error:
 *    HTTP/1.1 404 Not Found
 *
 */

/**
 * @apiDefine BadRequestError
 *
 * @apiError BadRequest The request was not formatted properly. Validation error or precondition not fulfilled.
 *
 * @apiErrorExample {json} Bad-Request-Error:
 *    HTTP/1.1 400 Bad Request
 *
 */

/**
 * @apiDefine AuthorizeError
 *
 * @apiError Unauthorized Authorization is required to consume this resource
 *
 * @apiErrorExample {json} Unauthorized-Error:
 *    HTTP/1.1 401 Unauthorized
 *
 */

/* ----------------------------- SIMPLE SUCCESS AND COMMON HEADERS ------------------------------ */

/**
 * @apiDefine SimpleSuccess
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *
 */

/**
 * @apiDefine AuthHeader
 *
 * @apiHeader (Authorization) {String} Authorization oAuth access token in the format "Bearer {token}"
 * @apiHeader (Authorization) {String} Refresh-Token oAuth refresh token in the format "Bearer {token}"
 *
 * @apiHeaderExample {text} Header-Example:
 *    Authorization: Bearer asdfds18472569asdpiowq985674126
 *    Refresh-Token: Bearer rgd1589647832pjtvountzq4y713g21
 */

/**
 * @apiDefine ApiKeyAuthHeader
 *
 * @apiHeader (Authorization) {String} Authorization oAuth access key in the format "Bearer {apiKey}"
 *
 * @apiHeaderExample {text} Header-Example:
 *    Authorization: Bearer tsLuthUh50tnaHuVWU52VQz7GD1ZksReEpgfRePwNSTtqYjF0CThNM3Ncq9TFcV5Giy1sjny8eWn2oVM7U7607m9st8gzfKuHSiPspYMRvhg2cQYsO5hJ3pDedtoVcYF
 */

/* ------------------------------ COMMON PARAMETER OBJECTS -------------------------------------- */


/**
 * @apiDefine UserParams
 *
 * @apiParam (Body) {String{1..64}} username Username set for the user. UNIQUE.
 * @apiParam (Body) {String{1..128}} profileImage Path to the image.
 * @apiParam (Body) {String{1..128}} name The first and last name of the user.
 * @apiParam (Body) {String{1..128}} profession Profession of the user.
 * @apiParam (Body) {String{1..20000}} personalText Text where the user describes himself (resume).
 * @apiParam (Body) {String{1..20000}} aboutText Text where user writes about his hobbies interests and everything he wants.
 * @apiParam (Body) {Object[]} projects Array of projects on which the user have worked.
 * @apiParam (Body) {String{1..128}} project.title Title of the project.
 * @apiParam (Body) {String{1..1024}} project.description Description of the project.
 * @apiParam (Body) {[String{1..32}]} project.technologies Technologies user for building the project.
 * @apiParam (Body) {String{1..128}} project.image Path to project image.
 * @apiParam (Body) {String{1..1024}} project.webLink HTTP link to production content.
 * @apiParam (Body) {String{1..1024}} project.githubLink HTTP link to code in github.
 * @apiParam (Body) {String{1..20000}} project.buildingReason Why the project was built.
 * @apiParam (Body) {Object[]} skills Array of skills on which the user have worked.
 * @apiParam (Body) {String{1..32}} skills.name Skill name.
 * @apiParam (Body) {Number{0..100}} skills.percentage Knowledge percentage with willingness to work.
 * @apiParam (Body) {String{1..2048}} skills.description Description about the skill.
 * @apiParam (Body) {String{7}} skills.titleColor Background colour when showing the skill name.
 * @apiParam (Body) {String{7}} skills.barColor Colour of skill level bar.
 * @apiParam (Body) {Object} socialMedias Links to social medias.
 * @apiParam (Body) {String{1..1024}} socialMedias.facebook HTTP link to facebook.
 * @apiParam (Body) {String{1..1024}} socialMedias.linkedIn HTTP link to linkedIn.
 * @apiParam (Body) {String{1..1024}} socialMedias.gitHub HTTP link to github.
 * @apiParam (Body) {Object} contact Contact information.
 * @apiParam (Body) {String{1..1024}} contact.address Address of the user.
 * @apiParam (Body) {String{6..14}} contact.phone Mobile phone of the user.
 * @apiParam (Body) {Boolean} contact.valid Whether the contact information is complete.
 * @apiParam (Body) {Boolean} valid Whether the user is completed.
 *
 *
 * @apiParamExample {json} Request-Example:
 *    {
   *      "name": "Dimitar Stefanov",
   *      "personalText": "Some short text",
   *      "aboutText": "Some other short text",
   *      "username": "dsstefanov",
   *      "projects": [{
   *        "title": "Portnis",
   *        "description": "Portfolio generator",
   *        "technologies": [
   *            "JavaScript", "TypeScript", "EcmaScript6",
   *            "Mongoose", "MongoDB", "NodeJS", "ExpressJS",
   *            "AngularJS"
   *         ],
   *         "image": "resources/dsstefanov2/Portnis.jpeg",
   *         "buildingReason": "Semester project"
   *      }],
   *      "skills": [{
   *        "name": "TypeScript",
   *        "percentage": 80,
   *        "description": "New to TS but having great passion",
   *        "titleColor": "#fff",
   *        "barColor": "#000"
   *      }],
   *      "profileImage": "resources/dsstefanov2/Profile.jpeg",
   *      "profession": "Web developer & Consultant",
   *      "socialMedias": {
   *        "facebook": "https://www.facebook.com/dsstefanov"
   *        "linkedIn": "https://www.linkedin.com/in/dimitar-stefanov-0274b5125/"
   *        "github": "https://github.com/Dsstefanov"
   *      },
   *      "contact": {
   *        "address":  "Christiansgade 1b",
   *        "phone": "53337660",
   *        "valid": true
   *      },
   *      "valid": true
   *    }
 */