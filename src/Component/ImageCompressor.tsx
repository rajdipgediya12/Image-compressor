import React, { useState, ChangeEvent, MouseEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "react-toastify/dist/ReactToastify.css";
import "./ImageCompresspr.css";

interface ImageState {
  compressedLink: string;
  originalImage: File | null;
  originalLink: string;
  clicked: boolean;
  uploadImage: boolean;
  originalSize: number;
  compressedSize: number;
  outputFileName: string;
}

const ImageCompressor: React.FC = () => {
  const [image, setImage] = useState<ImageState>({
    compressedLink: "",
    originalImage: null,
    originalLink: "",
    clicked: false,
    uploadImage: false,
    originalSize: 0,
    compressedSize: 0,
    outputFileName: "",
  });

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files && e.target.files[0];

    if (imageFile) {
      setImage({
        originalLink: URL.createObjectURL(imageFile),
        originalImage: imageFile,
        outputFileName: imageFile.name,
        uploadImage: true,
        originalSize: imageFile.size,
        compressedSize: 0,
        compressedLink: "",
        clicked: false,
      });
    }
  };

  const click = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 500,
      useWebWorker: true,
    };

    if (options.maxSizeMB >= (image.originalImage?.size || 0) / 1024) {
      showErrorToast("Image is too small, can't be Compressed!");
      return;
    }

    try {
      const output = await imageCompression(
        image.originalImage as File,
        options
      );

      if (output.size < image.originalSize) {
        const downloadLink = URL.createObjectURL(output);
        setImage((prevState: any) => ({
          ...prevState,
          compressedLink: downloadLink,
          clicked: true,
          compressedSize: output.size,
        }));
      } else {
        showErrorToast("Compression did not result in a smaller size.");
      }
    } catch (error) {
      console.error("Error during compression:", error);
      showErrorToast("Error during compression. Please try again.");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.compressedLink;
    link.download = image.outputFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container className="mt-5 custom-container">
      <Row className="text-center">
        <Col>
          <h1>Image Compressor</h1>
          <h3>1. Upload Image</h3>
          <h3>2. Click on Compress</h3>
          <h3>3. Preview and Download Compressed Image</h3>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col xl={4} lg={4} md={12} sm={12} className="text-center">
          {image.uploadImage ? (
            <Card>
              <Card.Img className="ht" variant="top" src={image.originalLink} />
              <Card.Body>
                <Card.Text>
                  Original Size: {image.originalSize / 1024} KB
                </Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <Card className="ht-placeholder">
              <Card.Body>
                <Card.Text>Original Size: 0 KB</Card.Text>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-center mt-3">
            <label htmlFor="upload-btn" className="btn btn-dark w-75">
              Upload Image
            </label>
            <input
              id="upload-btn"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={(e) => handle(e)}
            />
          </div>
        </Col>

        <Col
          xl={4}
          lg={4}
          md={12}
          sm={12}
          className="d-flex justify-content-center align-items-baseline"
        >
          <br />
          {image.outputFileName && (
            <Button variant="dark" onClick={(e) => click(e)}>
              Compress
            </Button>
          )}
        </Col>

        <Col xl={4} lg={4} md={12} sm={12} className="text-center mt-3">
          {image.clicked && (
            <Card>
              <Card.Img
                className="ht"
                variant="top"
                src={image.compressedLink}
              />
              <Card.Body>
                <Card.Text>
                  Compressed Size: {image.compressedSize / 1024} KB
                </Card.Text>
                <div className="d-flex justify-content-center mt-3">
                  <Button variant="dark" onClick={handleDownload}>
                    Download
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    <ToastContainer />
    </Container>
  );
};

export default ImageCompressor;
