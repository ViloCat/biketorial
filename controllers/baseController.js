class BaseController {
    /**
     * Handles a request by calling the provided service method and sending the response.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} serviceMethod - The service method to handle the request.
     */
    async handleRequest(req, res, serviceMethod) {
      try {
        const result = await serviceMethod(req);
        res.status(result.status).json(result.data);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
      }
    }
  }
  
  module.exports = BaseController;
  