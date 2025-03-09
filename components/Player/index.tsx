/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import {FC, useEffect, useRef, useState} from "react";
import {songs} from "../../utils/songs";
import styles from "./Player.module.scss";

export interface ISong {
    name: string;
    author: string;
    img: string;
    audio: string;
    duration?: string;
}

export const Player: FC = () => {
    const [currentPlay, setCurrentPlay] = useState<ISong>(songs[0]);
    const [currentTime, setCurrentTime] = useState("0:00");
    const musicList = songs;
    const [pause, setPause] = useState(true);

    // Refs with proper typing
    const playerRef = useRef<HTMLAudioElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const playheadRef = useRef<HTMLDivElement>(null);
    const hoverPlayheadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const playerRefCur = playerRef?.current;
        const timelineRefCur = timelineRef.current;
        playerRefCur?.addEventListener("timeupdate", timeUpdate, false);
        timelineRefCur?.addEventListener("click", changeCurrentTime as any, false);
        timelineRefCur?.addEventListener("mousemove", hoverTimeLine as any, false);
        timelineRefCur?.addEventListener("mouseout", resetTimeLine, false);

        return () => {
            playerRefCur?.removeEventListener("timeupdate", timeUpdate);
            timelineRefCur?.removeEventListener("click", changeCurrentTime as any);
            timelineRefCur?.removeEventListener("mousemove", hoverTimeLine as any);
            timelineRefCur?.removeEventListener("mouseout", resetTimeLine);
        };
    }, []);

    const changeCurrentTime = (e: any) => {
        const duration = playerRef?.current?.duration;
        const timeline = timelineRef.current;
        if (!timeline || !duration) return;

        const playheadWidth = timeline.offsetWidth;
        const offsetWidht = timeline.offsetLeft;
        const userClickWidht = e.clientX - offsetWidht;

        const userClickWidhtInPercent = (userClickWidht * 100) / playheadWidth;

        if (playheadRef.current) {
            playheadRef.current.style.width = userClickWidhtInPercent + "%";
        }
        if (playerRef?.current) {
            playerRef.current.currentTime = (duration * userClickWidhtInPercent) / 100;
        }
    };

    const hoverTimeLine = (e: any) => {
        const duration = playerRef?.current?.duration;
        const timeline = timelineRef.current;
        const hoverPlayhead = hoverPlayheadRef.current;
        
        if (!timeline || !hoverPlayhead) return;

        const playheadWidth = timeline.offsetWidth;
        const offsetWidht = timeline.offsetLeft;
        const userClickWidht = e.clientX - offsetWidht;
        const userClickWidhtInPercent = (userClickWidht * 100) / playheadWidth;

        if (userClickWidhtInPercent <= 100) {
            hoverPlayhead.style.width = userClickWidhtInPercent + "%";
        }

        if (duration) {
            const time = (duration * userClickWidhtInPercent) / 100;

            if (time >= 0 && time <= duration) {
                hoverPlayhead.dataset.content = formatTime(time);
            }
        }
    };

    const resetTimeLine = () => {
        const hoverPlayhead = hoverPlayheadRef.current;
        if (!hoverPlayhead) return;
        hoverPlayhead.style.width = "0%";
    };

    const timeUpdate = () => {
        const duration = playerRef?.current?.duration;
        const playhead = playheadRef.current;
        const player = playerRef.current;

        if (!duration || !playhead || !player?.currentTime) return;

        const playPercent = 100 * (player.currentTime / duration);
        playhead.style.width = playPercent + "%";
        const currentTime = formatTime(player.currentTime);
        setCurrentTime(currentTime);
    };

    const formatTime = (currentTime: number) => {
        const minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);

        const secondsStr = seconds >= 10 ? seconds.toString() : "0" + (seconds % 60);

        return minutes + ":" + secondsStr;
    };

    useEffect(() => {
        playerRef?.current?.load();
        playerRef?.current?.play().then(() => {
            setPause(false);
        });
    }, [currentPlay]);

    const updatePlayer = (index: number) => {
        const song = songs[index];
        setCurrentPlay(song);
    };

    const nextSong = () => {
        if (pause) {
            setPause(false);
        }
        const nextId = songs.indexOf(currentPlay) + 1;
        updatePlayer(nextId % musicList.length);
    };

    const prevSong = () => {
        if (pause) {
            setPause(false);
        }
        const prevId = songs.findIndex((x) => x.audio === currentPlay.audio) + musicList.length - 1;
        updatePlayer(prevId % musicList.length);
    };

    const playOrPause = async () => {
        if (pause) {
            await playerRef?.current?.play();
        } else {
            playerRef?.current?.pause();
        }
        setPause(!pause);
    };

    const clickAudio = (index: number) => {
        updatePlayer(index);
    };
    return (
        <div className={styles.card}>
            <div className={styles.currentSong}>
                <audio ref={playerRef} onEnded={nextSong} src={currentPlay.audio} autoPlay className={styles.audioPlayer}>
                    Your browser does not support the audio element.
                </audio>
                <div className={styles.imgWrap}>
                    <img src={currentPlay.img} alt={currentPlay.name} />
                </div>
                <span className={styles.songName}>{currentPlay.name}</span>
                <span className={styles.songAuthor}>{currentPlay.author || "Unknown"}</span>

                <div className={styles.timeContainer}>
                    <div className={styles.currentTime}>{currentTime}</div>
                    <div className={styles.endTime}>{currentPlay.duration}</div>
                </div>

                <div 
                    ref={timelineRef}
                    className={styles.timeline}
                    onClick={changeCurrentTime}
                    onMouseMove={hoverTimeLine}
                    onMouseLeave={resetTimeLine}
                >
                    <div ref={playheadRef} className={styles.playhead}></div>
                    <div
                        ref={hoverPlayheadRef}
                        className={styles.hoverPlayhead}
                        data-content="0:00"
                    ></div>
                </div>

                <div className={styles.controls}>
                    <button onClick={prevSong} className={styles.prevNextButton}>
                        <Image
                            src="/icons/previous.svg"
                            width={20}
                            height={20}
                            alt="Previous"
                        />
                    </button>

                    <button onClick={playOrPause} className={styles.playButton}>
                        {pause ? (
                            <Image 
                                src="/icons/play.svg"
                                width={20} 
                                height={20} 
                                alt="Play"
                            />
                        ) : (
                            <Image
                                src="/icons/pause.svg"
                                width={20}
                                height={20}
                                alt="Pause"
                            />
                        )}
                    </button>
                    <button onClick={nextSong} className={styles.prevNextButton}>
                        <Image 
                            src="/icons/next.svg"
                            width={20} 
                            height={20} 
                            alt="Next"
                        />
                    </button>
                </div>
            </div>
            <div className={styles.playlist}>
                {musicList.map((music, index) => (
                    <div
                        key={index}
                        onClick={() => clickAudio(index)}
                        className={`${styles.track} ${
                            currentPlay.audio === music.audio && pause ? styles.currentAudio : ""
                        } ${currentPlay.audio === music.audio && !pause ? styles.playNow : ""}`}
                    >
                        <img className={styles.trackImg} src={music.img} alt="" />
                        <div className={styles.trackDescription}>
                            <span className={styles.trackName}>{music.name}</span>
                            <span className={styles.trackAuthor}>{music.author}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
