export const testController = (req, res) => {
  res.status(200).send({
    message: "this is the test route!!",
    success: true,
  });
};
