import gsap from "gsap";

export const handlePressAnimation =(className) => {
    const item = document.querySelector(`.${className}`);
    item.style.display==="block" ? gsap.fromTo(document.querySelector(`.${className}`), {
        autoAlpha:1,
    },{
        duration:0.3,
        autoAlpha:0,
        ease:"sine.out",
        onComplete: () => {document.querySelector(`.${className}`).style.display="none"}
    }) : gsap.fromTo(item, {
        autoAlpha:0,
    },{
        duration:0.3,
        autoAlpha:1,
        ease:"sine.in",
        onStart: () => {item.style.display="block"}
    })
}