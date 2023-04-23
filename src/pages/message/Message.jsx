const Message = ({ title, message, image }) => {
    let imageDiv;
    if (image) {
        imageDiv =
            <img
                src={image}
                //   alt="404 image"
                style={{
                    position: 'absolute',
                    top: '60%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '800px',
                    height: '800px',
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            />
    }

    return (
        <div className="single">
            <div
                // style={{
                //     position: 'absolute',
                //     top: '10%',
                //     left: '50%',
                //     transform: 'translateX(-50%)',
                //     textAlign: 'center',
                // }}
            >
                <h1>{title}</h1>
                <h2>{message}</h2>
            </div>
            {imageDiv}
        </div>
    );
};

export default Message;