import '../EditProgram.css';

export const RoomInformation = ({ roomDescription }) => {
    return (
        <div id="roomDescription">
            <h3>Room Information</h3>
            <p>{roomDescription}</p>
        </div>
    )
}