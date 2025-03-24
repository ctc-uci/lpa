import { React, forwardRef } from "react";

export const sessionsCalendar = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path d="M14.6794 18C13.9794 18 13.3878 17.7583 12.9044 17.275C12.4211 16.7917 12.1794 16.2 12.1794 15.5C12.1794 14.8 12.4211 14.2083 12.9044 13.725C13.3878 13.2417 13.9794 13 14.6794 13C15.3794 13 15.9711 13.2417 16.4544 13.725C16.9378 14.2083 17.1794 14.8 17.1794 15.5C17.1794 16.2 16.9378 16.7917 16.4544 17.275C15.9711 17.7583 15.3794 18 14.6794 18ZM5.17944 22C4.62944 22 4.15878 21.8043 3.76744 21.413C3.37611 21.0217 3.18011 20.5507 3.17944 20V6C3.17944 5.45 3.37544 4.97933 3.76744 4.588C4.15944 4.19667 4.63011 4.00067 5.17944 4H6.17944V3C6.17944 2.71667 6.27544 2.47933 6.46744 2.288C6.65944 2.09667 6.89678 2.00067 7.17944 2C7.46211 1.99933 7.69978 2.09533 7.89244 2.288C8.08511 2.48067 8.18078 2.718 8.17944 3V4H16.1794V3C16.1794 2.71667 16.2754 2.47933 16.4674 2.288C16.6594 2.09667 16.8968 2.00067 17.1794 2C17.4621 1.99933 17.6998 2.09533 17.8924 2.288C18.0851 2.48067 18.1808 2.718 18.1794 3V4H19.1794C19.7294 4 20.2004 4.196 20.5924 4.588C20.9844 4.98 21.1801 5.45067 21.1794 6V20C21.1794 20.55 20.9838 21.021 20.5924 21.413C20.2011 21.805 19.7301 22.0007 19.1794 22H5.17944ZM5.17944 20H19.1794V10H5.17944V20Z" fill="#474849" />
        </svg>
    )
};

export const filterDateCalendar = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15.8333 15.8333H4.16667V6.66665H15.8333M13.3333 0.833313V2.49998H6.66667V0.833313H5V2.49998H4.16667C3.24167 2.49998 2.5 3.24165 2.5 4.16665V15.8333C2.5 16.2753 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H15.8333C16.2754 17.5 16.6993 17.3244 17.0118 17.0118C17.3244 16.6993 17.5 16.2753 17.5 15.8333V4.16665C17.5 3.72462 17.3244 3.3007 17.0118 2.98813C16.6993 2.67557 16.2754 2.49998 15.8333 2.49998H15V0.833313M14.1667 9.99998H10V14.1666H14.1667V9.99998Z" fill="#767778" />
        </svg>
    )
};

export const filterButton = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path d="M5.17936 10.3973C4.73733 10.3973 4.31341 10.2217 4.00085 9.90911C3.68829 9.59655 3.5127 9.17263 3.5127 8.7306C3.5127 8.28857 3.68829 7.86465 4.00085 7.55209C4.31341 7.23953 4.73733 7.06393 5.17936 7.06393M5.17936 10.3973C5.62139 10.3973 6.04531 10.2217 6.35787 9.90911C6.67043 9.59655 6.84603 9.17263 6.84603 8.7306C6.84603 8.28857 6.67043 7.86465 6.35787 7.55209C6.04531 7.23953 5.62139 7.06393 5.17936 7.06393M5.17936 10.3973V17.0639M5.17936 7.06393V3.7306M10.1794 15.3973C9.73733 15.3973 9.31341 15.2217 9.00085 14.9091C8.68829 14.5965 8.5127 14.1726 8.5127 13.7306C8.5127 13.2886 8.68829 12.8646 9.00085 12.5521C9.31341 12.2395 9.73733 12.0639 10.1794 12.0639M10.1794 15.3973C10.6214 15.3973 11.0453 15.2217 11.3579 14.9091C11.6704 14.5965 11.846 14.1726 11.846 13.7306C11.846 13.2886 11.6704 12.8646 11.3579 12.5521C11.0453 12.2395 10.6214 12.0639 10.1794 12.0639M10.1794 15.3973V17.0639M10.1794 12.0639V3.7306M15.1794 7.89727C14.7373 7.89727 14.3134 7.72167 14.0009 7.40911C13.6883 7.09655 13.5127 6.67263 13.5127 6.2306C13.5127 5.78857 13.6883 5.36465 14.0009 5.05209C14.3134 4.73953 14.7373 4.56393 15.1794 4.56393M15.1794 7.89727C15.6214 7.89727 16.0453 7.72167 16.3579 7.40911C16.6704 7.09655 16.846 6.67263 16.846 6.2306C16.846 5.78857 16.6704 5.36465 16.3579 5.05209C16.0453 4.73953 15.6214 4.56393 15.1794 4.56393M15.1794 7.89727V17.0639M15.1794 4.56393V3.7306" stroke="#767778" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
};

export const sessionsUpArrow = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M0.679744 7.79453H9.68C9.77112 7.79424 9.86044 7.76911 9.93834 7.72184C10.0162 7.67457 10.0798 7.60694 10.1221 7.52625C10.1644 7.44555 10.184 7.35484 10.1786 7.26387C10.1732 7.17291 10.1431 7.08514 10.0915 7.01001L5.59138 0.509824C5.40488 0.240317 4.95587 0.240317 4.76886 0.509824L0.268733 7.01001C0.216644 7.08498 0.186097 7.1728 0.180413 7.26391C0.174728 7.35503 0.194123 7.44596 0.236489 7.52683C0.278855 7.60769 0.342573 7.6754 0.420719 7.7226C0.498866 7.7698 0.588452 7.79467 0.679744 7.79453ZM5.17987 1.67286L8.72597 6.7945H1.63377L5.17987 1.67286Z" fill="#767778" />
        </svg>
    )
};

export const sessionsDownArrow = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M0.679744 0.794535H9.68C9.77112 0.794821 9.86044 0.819953 9.93834 0.867226C10.0162 0.914499 10.0798 0.982123 10.1221 1.06282C10.1644 1.14351 10.184 1.23423 10.1786 1.32519C10.1732 1.41616 10.1431 1.50393 10.0915 1.57906L5.59138 8.07924C5.40488 8.34875 4.95587 8.34875 4.76886 8.07924L0.268733 1.57906C0.216644 1.50408 0.186097 1.41627 0.180413 1.32515C0.174728 1.23404 0.194123 1.14311 0.236489 1.06224C0.278855 0.981372 0.342573 0.913661 0.420719 0.866465C0.498866 0.819269 0.588452 0.794391 0.679744 0.794535ZM5.17987 6.91621L8.72597 1.79456H1.63377L5.17987 6.91621Z" fill="#767778" />
        </svg>
    )
};

export const sessionsClock = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path d="M14.8461 3.57787C16.103 4.30358 17.1485 5.34497 17.8792 6.59895C18.61 7.85293 19.0005 9.27601 19.0123 10.7273C19.024 12.1786 18.6565 13.6078 17.9461 14.8734C17.2357 16.1391 16.2071 17.1972 14.9621 17.9431C13.7171 18.6891 12.2989 19.0969 10.8478 19.1263C9.39676 19.1556 7.96319 18.8055 6.68903 18.1106C5.41487 17.4156 4.34429 16.4 3.58329 15.1641C2.82229 13.9283 2.39724 12.5151 2.35024 11.0645L2.34607 10.7945L2.35024 10.5245C2.39691 9.08536 2.81569 7.68283 3.56577 6.45369C4.31585 5.22455 5.37161 4.21074 6.63015 3.5111C7.88868 2.81146 9.30702 2.44986 10.7469 2.46156C12.1868 2.47326 13.5991 2.85786 14.8461 3.57787ZM10.6794 5.79453C10.4753 5.79456 10.2783 5.8695 10.1258 6.00513C9.97323 6.14076 9.87578 6.32766 9.8519 6.53037L9.84607 6.62787V10.7945L9.85357 10.9037C9.87257 11.0483 9.92918 11.1853 10.0177 11.3012L10.0902 11.3845L12.5902 13.8845L12.6686 13.9529C12.8147 14.0663 12.9944 14.1278 13.1794 14.1278C13.3644 14.1278 13.5441 14.0663 13.6902 13.9529L13.7686 13.8837L13.8377 13.8054C13.9511 13.6592 14.0127 13.4795 14.0127 13.2945C14.0127 13.1096 13.9511 12.9298 13.8377 12.7837L13.7686 12.7054L11.5127 10.4487V6.62787L11.5069 6.53037C11.483 6.32766 11.3856 6.14076 11.233 6.00513C11.0805 5.8695 10.8835 5.79456 10.6794 5.79453Z" fill="#767778" />
        </svg>
    )
};

export const sessionsMapPin = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0645 19.2395C10.0645 19.2395 4.01282 14.1429 4.01282 9.12786C4.01282 7.35975 4.7152 5.66406 5.96544 4.41382C7.21568 3.16358 8.91137 2.4612 10.6795 2.4612C12.4476 2.4612 14.1433 3.16358 15.3935 4.41382C16.6438 5.66406 17.3462 7.35975 17.3462 9.12786C17.3462 14.1429 11.2945 19.2395 11.2945 19.2395C10.9578 19.5495 10.4037 19.5462 10.0645 19.2395ZM10.6795 12.0445C11.0625 12.0445 11.4418 11.9691 11.7956 11.8225C12.1495 11.6759 12.471 11.4611 12.7419 11.1903C13.0127 10.9194 13.2276 10.5979 13.3741 10.244C13.5207 9.89016 13.5962 9.51089 13.5962 9.12786C13.5962 8.74484 13.5207 8.36557 13.3741 8.0117C13.2276 7.65784 13.0127 7.33631 12.7419 7.06547C12.471 6.79463 12.1495 6.57979 11.7956 6.43322C11.4418 6.28664 11.0625 6.2112 10.6795 6.2112C9.90594 6.2112 9.16407 6.51849 8.61709 7.06547C8.07011 7.61245 7.76282 8.35432 7.76282 9.12786C7.76282 9.90141 8.07011 10.6433 8.61709 11.1903C9.16407 11.7372 9.90594 12.0445 10.6795 12.0445Z" fill="#767778" />
        </svg>
    )
};

export const sessionsEllipsis = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 39 39" fill="none">
            <path d="M34.2211 19.7945C34.2211 15.8052 32.6364 11.9793 29.8155 9.15845C26.9947 6.33759 23.1688 4.75285 19.1795 4.75285C15.1902 4.75285 11.3643 6.33759 8.54342 9.15845C5.72256 11.9793 4.13782 15.8052 4.13782 19.7945C4.13782 23.7838 5.72256 27.6097 8.54342 30.4306C11.3643 33.2514 15.1902 34.8362 19.1795 34.8362C23.1688 34.8362 26.9947 33.2514 29.8155 30.4306C32.6364 27.6097 34.2211 23.7838 34.2211 19.7945Z" fill="#F6F6F6" stroke="#D2D2D2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12.4282 19.7945C12.4282 19.5119 12.3159 19.2409 12.1161 19.041C11.9162 18.8412 11.6452 18.7289 11.3626 18.7289C11.08 18.7289 10.8089 18.8412 10.6091 19.041C10.4093 19.2409 10.297 19.5119 10.297 19.7945C10.297 20.0771 10.4093 20.3482 10.6091 20.548C10.8089 20.7478 11.08 20.8601 11.3626 20.8601C11.6452 20.8601 11.9162 20.7478 12.1161 20.548C12.3159 20.3482 12.4282 20.0771 12.4282 19.7945ZM20.2451 19.7945C20.2451 19.5119 20.1328 19.2409 19.933 19.041C19.7331 18.8412 19.4621 18.7289 19.1795 18.7289C18.8969 18.7289 18.6259 18.8412 18.426 19.041C18.2262 19.2409 18.1139 19.5119 18.1139 19.7945C18.1139 20.0771 18.2262 20.3482 18.426 20.548C18.6259 20.7478 18.8969 20.8601 19.1795 20.8601C19.4621 20.8601 19.7331 20.7478 19.933 20.548C20.1328 20.3482 20.2451 20.0771 20.2451 19.7945ZM28.062 19.7945C28.062 19.5119 27.9497 19.2409 27.7499 19.041C27.5501 18.8412 27.279 18.7289 26.9964 18.7289C26.7138 18.7289 26.4428 18.8412 26.2429 19.041C26.0431 19.2409 25.9308 19.5119 25.9308 19.7945C25.9308 20.0771 26.0431 20.3482 26.2429 20.548C26.4428 20.7478 26.7138 20.8601 26.9964 20.8601C27.279 20.8601 27.5501 20.7478 27.7499 20.548C27.9497 20.3482 28.062 20.0771 28.062 19.7945Z" fill="#767778" stroke="#767778" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
};

export const sessionsFilterClock = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21" fill="none">
            <path d="M14.8461 3.57787C16.103 4.30358 17.1485 5.34497 17.8792 6.59895C18.61 7.85293 19.0005 9.27601 19.0123 10.7273C19.024 12.1786 18.6565 13.6078 17.9461 14.8734C17.2357 16.1391 16.2071 17.1972 14.9621 17.9431C13.7171 18.6891 12.2989 19.0969 10.8478 19.1263C9.39676 19.1556 7.96319 18.8055 6.68903 18.1106C5.41487 17.4156 4.34429 16.4 3.58329 15.1641C2.82229 13.9283 2.39724 12.5151 2.35024 11.0645L2.34607 10.7945L2.35024 10.5245C2.39691 9.08536 2.81569 7.68283 3.56577 6.45369C4.31585 5.22455 5.37161 4.21074 6.63015 3.5111C7.88868 2.81146 9.30702 2.44986 10.7469 2.46156C12.1868 2.47326 13.5991 2.85786 14.8461 3.57787ZM10.6794 5.79453C10.4753 5.79456 10.2783 5.8695 10.1258 6.00513C9.97323 6.14076 9.87578 6.32766 9.8519 6.53037L9.84607 6.62787V10.7945L9.85357 10.9037C9.87257 11.0483 9.92918 11.1853 10.0177 11.3012L10.0902 11.3845L12.5902 13.8845L12.6686 13.9529C12.8147 14.0663 12.9944 14.1278 13.1794 14.1278C13.3644 14.1278 13.5441 14.0663 13.6902 13.9529L13.7686 13.8837L13.8377 13.8054C13.9511 13.6592 14.0127 13.4795 14.0127 13.2945C14.0127 13.1096 13.9511 12.9298 13.8377 12.7837L13.7686 12.7054L11.5127 10.4487V6.62787L11.5069 6.53037C11.483 6.32766 11.3856 6.14076 11.233 6.00513C11.0805 5.8695 10.8835 5.79456 10.6794 5.79453Z" fill="#767778" />
        </svg>
    )
};

export const sessionsFilterMapPin = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0645 19.2395C10.0645 19.2395 4.01282 14.1429 4.01282 9.12786C4.01282 7.35975 4.7152 5.66406 5.96544 4.41382C7.21568 3.16358 8.91137 2.4612 10.6795 2.4612C12.4476 2.4612 14.1433 3.16358 15.3935 4.41382C16.6438 5.66406 17.3462 7.35975 17.3462 9.12786C17.3462 14.1429 11.2945 19.2395 11.2945 19.2395C10.9578 19.5495 10.4037 19.5462 10.0645 19.2395ZM10.6795 12.0445C11.0625 12.0445 11.4418 11.9691 11.7956 11.8225C12.1495 11.6759 12.471 11.4611 12.7419 11.1903C13.0127 10.9194 13.2276 10.5979 13.3741 10.244C13.5207 9.89016 13.5962 9.51089 13.5962 9.12786C13.5962 8.74484 13.5207 8.36557 13.3741 8.0117C13.2276 7.65784 13.0127 7.33631 12.7419 7.06547C12.471 6.79463 12.1495 6.57979 11.7956 6.43322C11.4418 6.28664 11.0625 6.2112 10.6795 6.2112C9.90594 6.2112 9.16407 6.51849 8.61709 7.06547C8.07011 7.61245 7.76282 8.35432 7.76282 9.12786C7.76282 9.90141 8.07011 10.6433 8.61709 11.1903C9.16407 11.7372 9.90594 12.0445 10.6795 12.0445Z" fill="#767778" />
        </svg>
    )
};

export const archiveBox = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path d="M3.6795 7.6875V19.125C3.6795 19.8212 3.95607 20.4889 4.44835 20.9812C4.94063 21.4734 5.60831 21.75 6.3045 21.75H19.0545C19.7507 21.75 20.4184 21.4734 20.9107 20.9812C21.4029 20.4889 21.6795 19.8212 21.6795 19.125V7.6875C21.6795 7.63777 21.6598 7.59008 21.6246 7.55492C21.5894 7.51975 21.5417 7.5 21.492 7.5H3.867C3.81728 7.5 3.76958 7.51975 3.73442 7.55492C3.69926 7.59008 3.6795 7.63777 3.6795 7.6875ZM16.1951 14.7952L13.2097 17.7802C13.069 17.9207 12.8783 17.9997 12.6795 17.9997C12.4807 17.9997 12.29 17.9207 12.1493 17.7802L9.16388 14.7952C8.87841 14.5097 8.85216 14.0452 9.12404 13.7461C9.19228 13.6709 9.27509 13.6104 9.36742 13.5681C9.45976 13.5259 9.55972 13.5029 9.66123 13.5004C9.76273 13.498 9.86368 13.5161 9.95795 13.5539C10.0522 13.5916 10.1379 13.648 10.2097 13.7198L11.9295 15.4392V10.5211C11.9295 10.1175 12.2398 9.77109 12.6434 9.75094C12.7448 9.74605 12.8462 9.76181 12.9413 9.79724C13.0364 9.83268 13.1234 9.88707 13.1969 9.9571C13.2704 10.0271 13.3289 10.1114 13.3689 10.2047C13.4089 10.298 13.4295 10.3985 13.4295 10.5V15.4392L15.1493 13.7198C15.2211 13.648 15.3068 13.5916 15.4011 13.5539C15.4953 13.5161 15.5963 13.498 15.6978 13.5004C15.7993 13.5029 15.8992 13.5259 15.9916 13.5681C16.0839 13.6104 16.1667 13.6709 16.235 13.7461C16.5068 14.0447 16.4806 14.5097 16.1951 14.7952Z" fill="#474849" />
            <path d="M21.6795 2.25H3.6795C2.85108 2.25 2.1795 2.92157 2.1795 3.75V4.5C2.1795 5.32843 2.85108 6 3.6795 6H21.6795C22.5079 6 23.1795 5.32843 23.1795 4.5V3.75C23.1795 2.92157 22.5079 2.25 21.6795 2.25Z" fill="#474849" />
        </svg>
    )
};

export const archiveCalendar = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
            <path d="M16.3333 15.8335H4.66661V6.66683H16.3333M13.8333 0.833496V2.50016H7.16661V0.833496H5.49994V2.50016H4.66661C3.74161 2.50016 2.99994 3.24183 2.99994 4.16683V15.8335C2.99994 16.2755 3.17553 16.6994 3.48809 17.012C3.80065 17.3246 4.22458 17.5002 4.66661 17.5002H16.3333C16.7753 17.5002 17.1992 17.3246 17.5118 17.012C17.8243 16.6994 17.9999 16.2755 17.9999 15.8335V4.16683C17.9999 3.7248 17.8243 3.30088 17.5118 2.98832C17.1992 2.67576 16.7753 2.50016 16.3333 2.50016H15.4999V0.833496M14.6666 10.0002H10.4999V14.1668H14.6666V10.0002Z" fill="#767778" />
        </svg>
    )
};

export const archiveClock = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.1666 2.78357C15.4235 3.50928 16.4691 4.55067 17.1998 5.80465C17.9305 7.05863 18.3211 8.48171 18.3328 9.93302C18.3445 11.3843 17.977 12.8135 17.2666 14.0792C16.5563 15.3448 15.5277 16.4029 14.2827 17.1488C13.0377 17.8948 11.6194 18.3026 10.1684 18.332C8.71732 18.3613 7.28375 18.0112 6.00959 17.3163C4.73542 16.6213 3.66485 15.6057 2.90385 14.3698C2.14284 13.134 1.7178 11.7208 1.67079 10.2702L1.66663 10.0002L1.67079 9.73024C1.71746 8.29106 2.13625 6.88854 2.88633 5.6594C3.6364 4.43026 4.69217 3.41645 5.9507 2.7168C7.20923 2.01716 8.62758 1.65557 10.0675 1.66727C11.5073 1.67897 12.9196 2.06357 14.1666 2.78357ZM9.99996 5.00024C9.79585 5.00026 9.59884 5.0752 9.44631 5.21083C9.29379 5.34646 9.19634 5.53336 9.17246 5.73607L9.16663 5.83357V10.0002L9.17413 10.1094C9.19313 10.254 9.24973 10.391 9.33829 10.5069L9.41079 10.5902L11.9108 13.0902L11.9891 13.1586C12.1353 13.272 12.315 13.3335 12.5 13.3335C12.6849 13.3335 12.8646 13.272 13.0108 13.1586L13.0891 13.0894L13.1583 13.0111C13.2717 12.8649 13.3332 12.6852 13.3332 12.5002C13.3332 12.3153 13.2717 12.1355 13.1583 11.9894L13.0891 11.9111L10.8333 9.6544V5.83357L10.8275 5.73607C10.8036 5.53336 10.7061 5.34646 10.5536 5.21083C10.4011 5.0752 10.2041 5.00026 9.99996 5.00024Z" fill="#767778" />
        </svg>
    )
};

export const archiveMapPin = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.38504 18.4448C9.38504 18.4448 3.33337 13.3482 3.33337 8.33317C3.33337 6.56506 4.03575 4.86937 5.286 3.61913C6.53624 2.36888 8.23193 1.6665 10 1.6665C11.7682 1.6665 13.4638 2.36888 14.7141 3.61913C15.9643 4.86937 16.6667 6.56506 16.6667 8.33317C16.6667 13.3482 10.615 18.4448 10.615 18.4448C10.2784 18.7548 9.72421 18.7515 9.38504 18.4448ZM10 11.2498C10.3831 11.2498 10.7623 11.1744 11.1162 11.0278C11.4701 10.8812 11.7916 10.6664 12.0624 10.3956C12.3333 10.1247 12.5481 9.8032 12.6947 9.44933C12.8413 9.09546 12.9167 8.71619 12.9167 8.33317C12.9167 7.95015 12.8413 7.57088 12.6947 7.21701C12.5481 6.86314 12.3333 6.54161 12.0624 6.27078C11.7916 5.99994 11.4701 5.7851 11.1162 5.63852C10.7623 5.49195 10.3831 5.4165 10 5.4165C9.22649 5.4165 8.48463 5.72379 7.93765 6.27078C7.39067 6.81776 7.08337 7.55962 7.08337 8.33317C7.08337 9.10672 7.39067 9.84858 7.93765 10.3956C8.48463 10.9425 9.22649 11.2498 10 11.2498Z" fill="#767778" />
        </svg>
    )
};

export const archivePerson = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path d="M4.25 18C4.25 18 3 18 3 16.75C3 15.5 4.25 11.75 10.5 11.75C16.75 11.75 18 15.5 18 16.75C18 18 16.75 18 16.75 18H4.25ZM10.5 10.5C11.4946 10.5 12.4484 10.1049 13.1517 9.40165C13.8549 8.69839 14.25 7.74456 14.25 6.75C14.25 5.75544 13.8549 4.80161 13.1517 4.09835C12.4484 3.39509 11.4946 3 10.5 3C9.50544 3 8.55161 3.39509 7.84835 4.09835C7.14509 4.80161 6.75 5.75544 6.75 6.75C6.75 7.74456 7.14509 8.69839 7.84835 9.40165C8.55161 10.1049 9.50544 10.5 10.5 10.5Z" fill="#767778" />
        </svg>
    )
};

export const archiveMagnifyingGlass = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
            <path d="M8.41667 13.3333C6.90278 13.3333 5.62167 12.8089 4.57333 11.76C3.525 10.7111 3.00056 9.43 3 7.91667C2.99944 6.40333 3.52389 5.12222 4.57333 4.07333C5.62278 3.02444 6.90389 2.5 8.41667 2.5C9.92944 2.5 11.2108 3.02444 12.2608 4.07333C13.3108 5.12222 13.835 6.40333 13.8333 7.91667C13.8333 8.52778 13.7361 9.10417 13.5417 9.64583C13.3472 10.1875 13.0833 10.6667 12.75 11.0833L17.4167 15.75C17.5694 15.9028 17.6458 16.0972 17.6458 16.3333C17.6458 16.5694 17.5694 16.7639 17.4167 16.9167C17.2639 17.0694 17.0694 17.1458 16.8333 17.1458C16.5972 17.1458 16.4028 17.0694 16.25 16.9167L11.5833 12.25C11.1667 12.5833 10.6875 12.8472 10.1458 13.0417C9.60417 13.2361 9.02778 13.3333 8.41667 13.3333ZM8.41667 11.6667C9.45833 11.6667 10.3439 11.3022 11.0733 10.5733C11.8028 9.84444 12.1672 8.95889 12.1667 7.91667C12.1661 6.87444 11.8017 5.98917 11.0733 5.26083C10.345 4.5325 9.45944 4.16778 8.41667 4.16667C7.37389 4.16556 6.48861 4.53028 5.76083 5.26083C5.03306 5.99139 4.66833 6.87667 4.66667 7.91667C4.665 8.95667 5.02972 9.84222 5.76083 10.5733C6.49195 11.3044 7.37722 11.6689 8.41667 11.6667Z" fill="#767778" />
        </svg>
    )
};

export const duplicateIcon = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
            <path d="M13.8333 0.666504C14.2754 0.666504 14.6993 0.842099 15.0118 1.15466C15.3244 1.46722 15.5 1.89114 15.5 2.33317V12.3332C15.5 12.7752 15.3244 13.1991 15.0118 13.5117C14.6993 13.8242 14.2754 13.9998 13.8333 13.9998H12.1667V15.6665C12.1667 16.1085 11.9911 16.5325 11.6785 16.845C11.3659 17.1576 10.942 17.3332 10.5 17.3332H2.16667C1.72464 17.3332 1.30072 17.1576 0.988155 16.845C0.675595 16.5325 0.5 16.1085 0.5 15.6665V5.6665C0.5 5.22448 0.675595 4.80055 0.988155 4.48799C1.30072 4.17543 1.72464 3.99984 2.16667 3.99984H3.83333V2.33317C3.83333 1.89114 4.00893 1.46722 4.32149 1.15466C4.63405 0.842099 5.05797 0.666504 5.5 0.666504H13.8333ZM6.33333 11.4998H4.66667C4.45427 11.5001 4.24997 11.5814 4.09553 11.7272C3.94108 11.873 3.84814 12.0723 3.83569 12.2843C3.82324 12.4964 3.89223 12.7052 4.02855 12.868C4.16488 13.0309 4.35825 13.1356 4.56917 13.1607L4.66667 13.1665H6.33333C6.54573 13.1663 6.75003 13.0849 6.90447 12.9391C7.05892 12.7933 7.15186 12.594 7.16431 12.382C7.17676 12.17 7.10777 11.9612 6.97145 11.7983C6.83512 11.6354 6.64175 11.5308 6.43083 11.5057L6.33333 11.4998ZM13.8333 2.33317H5.5V3.99984H10.5C10.942 3.99984 11.3659 4.17543 11.6785 4.48799C11.9911 4.80055 12.1667 5.22448 12.1667 5.6665V12.3332H13.8333V2.33317ZM8 8.1665H4.66667C4.44565 8.1665 4.23369 8.2543 4.07741 8.41058C3.92113 8.56686 3.83333 8.77882 3.83333 8.99984C3.83333 9.22085 3.92113 9.43281 4.07741 9.58909C4.23369 9.74537 4.44565 9.83317 4.66667 9.83317H8C8.22101 9.83317 8.43297 9.74537 8.58926 9.58909C8.74554 9.43281 8.83333 9.22085 8.83333 8.99984C8.83333 8.77882 8.74554 8.56686 8.58926 8.41058C8.43297 8.2543 8.22101 8.1665 8 8.1665Z" fill="#767778" />
        </svg>
    )
};

export const reactivateIcon = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3333 17.0148C16.2944 14.5259 14.4838 13.1137 12.9016 12.7782C11.3194 12.4426 9.81301 12.3919 8.38246 12.6261V17.0832L1.66663 9.81025L8.38246 2.9165V7.15275C11.0277 7.17359 13.2766 8.12262 15.1291 9.99984C16.9813 11.8771 18.0494 14.2154 18.3333 17.0148Z" fill="#767778" stroke="#767778" stroke-width="2" stroke-linejoin="round" />
        </svg>
    )
};

export const deleteIcon = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.7008 3.10083L12.945 4.79167H16.25C16.4158 4.79167 16.5747 4.85751 16.6919 4.97472C16.8092 5.09193 16.875 5.25091 16.875 5.41667C16.875 5.58243 16.8092 5.7414 16.6919 5.85861C16.5747 5.97582 16.4158 6.04167 16.25 6.04167H15.6092L14.8817 14.5292C14.8375 15.0458 14.8017 15.4708 14.7442 15.8142C14.6858 16.1717 14.5967 16.4917 14.4225 16.7883C14.149 17.2543 13.7424 17.6278 13.255 17.8608C12.945 18.0083 12.6183 18.0692 12.2567 18.0975C11.9092 18.125 11.4833 18.125 10.965 18.125H9.035C8.51667 18.125 8.09083 18.125 7.74333 18.0975C7.38167 18.0692 7.055 18.0083 6.745 17.8608C6.25757 17.6278 5.85098 17.2543 5.5775 16.7883C5.4025 16.4917 5.315 16.1717 5.25583 15.8142C5.19833 15.47 5.1625 15.0458 5.11833 14.5292L4.39083 6.04167H3.75C3.58424 6.04167 3.42527 5.97582 3.30806 5.85861C3.19085 5.7414 3.125 5.58243 3.125 5.41667C3.125 5.25091 3.19085 5.09193 3.30806 4.97472C3.42527 4.85751 3.58424 4.79167 3.75 4.79167H7.055L7.29917 3.10083L7.30833 3.05C7.46 2.39167 8.025 1.875 8.73333 1.875H11.2667C11.975 1.875 12.54 2.39167 12.6917 3.05L12.7008 3.10083ZM8.3175 4.79167H11.6817L11.4683 3.31167C11.4283 3.1725 11.3267 3.125 11.2658 3.125H8.73417C8.67333 3.125 8.57167 3.1725 8.53167 3.31167L8.3175 4.79167ZM9.375 8.75C9.375 8.58424 9.30915 8.42527 9.19194 8.30806C9.07473 8.19085 8.91576 8.125 8.75 8.125C8.58424 8.125 8.42527 8.19085 8.30806 8.30806C8.19085 8.42527 8.125 8.58424 8.125 8.75V12.9167C8.125 13.0824 8.19085 13.2414 8.30806 13.3586C8.42527 13.4758 8.58424 13.5417 8.75 13.5417C8.91576 13.5417 9.07473 13.4758 9.19194 13.3586C9.30915 13.2414 9.375 13.0824 9.375 12.9167V8.75ZM11.875 8.75C11.875 8.58424 11.8092 8.42527 11.6919 8.30806C11.5747 8.19085 11.4158 8.125 11.25 8.125C11.0842 8.125 10.9253 8.19085 10.8081 8.30806C10.6908 8.42527 10.625 8.58424 10.625 8.75V12.9167C10.625 13.0824 10.6908 13.2414 10.8081 13.3586C10.9253 13.4758 11.0842 13.5417 11.25 13.5417C11.4158 13.5417 11.5747 13.4758 11.6919 13.3586C11.8092 13.2414 11.875 13.0824 11.875 12.9167V8.75Z" fill="#90080F" />
        </svg>
    )
};

export const BackIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.41 3.41L10 2L4 8L10 14L11.41 12.59L6.83 8L11.41 3.41Z" fill="#2D3748" />
        </svg>
    );
};

export const TooltipIcon = forwardRef((props, ref) => {
    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            {...props}
        >
            <path d="M8 1C4.13438 1 1 4.13438 1 8C1 11.8656 4.13438 15 8 15C11.8656 15 15 11.8656 15 8C15 4.13438 11.8656 1 8 1ZM8 13.8125C4.79063 13.8125 2.1875 11.2094 2.1875 8C2.1875 4.79063 4.79063 2.1875 8 2.1875C11.2094 2.1875 13.8125 4.79063 13.8125 8C13.8125 11.2094 11.2094 13.8125 8 13.8125Z" fill="#4A5568" />
            <path d="M7.25 5.25C7.25 5.44891 7.32902 5.63968 7.46967 5.78033C7.61032 5.92098 7.80109 6 8 6C8.19891 6 8.38968 5.92098 8.53033 5.78033C8.67098 5.63968 8.75 5.44891 8.75 5.25C8.75 5.05109 8.67098 4.86032 8.53033 4.71967C8.38968 4.57902 8.19891 4.5 8 4.5C7.80109 4.5 7.61032 4.57902 7.46967 4.71967C7.32902 4.86032 7.25 5.05109 7.25 5.25ZM8.375 7H7.625C7.55625 7 7.5 7.05625 7.5 7.125V11.375C7.5 11.4437 7.55625 11.5 7.625 11.5H8.375C8.44375 11.5 8.5 11.4437 8.5 11.375V7.125C8.5 7.05625 8.44375 7 8.375 7Z" fill="#4A5568" />
        </svg>
    );
});
